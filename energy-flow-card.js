// energy-flow-card.js  v1.21.0

// Constants
const PILL_POSITIONS=[
  {value:'hidden',       label:'Hidden'},
  {value:'top-left',     label:'Top Left'},
  {value:'top-center',   label:'Top Center'},
  {value:'top-right',    label:'Top Right'},
  {value:'middle-left',  label:'Middle Left'},
  {value:'middle-right', label:'Middle Right'},
  {value:'bottom-left',  label:'Bottom Left'},
  {value:'bottom-center',label:'Bottom Center'},
  {value:'bottom-right', label:'Bottom Right'},
];

const PILL_POS_CSS={
  'top-left':     'left:12px;top:12px;',
  'top-center':   'left:50%;top:12px;transform:translateX(-50%);',
  'top-right':    'right:12px;top:12px;',
  'middle-left':  'left:12px;top:50%;transform:translateY(-50%);',
  'middle-right': 'right:12px;top:50%;transform:translateY(-50%);',
  'bottom-left':  'left:12px;bottom:12px;',
  'bottom-center':'left:50%;bottom:12px;transform:translateX(-50%);',
  'bottom-right': 'right:12px;bottom:12px;',
};

// Localization keys that match standard HA entities-card editor keys
const _L={
  entity: 'ui.panel.lovelace.editor.card.generic.entity',
  label:  'ui.panel.lovelace.editor.card.generic.name',
  icon:   'ui.panel.lovelace.editor.card.generic.icon',
};

class EnergyFlowCardEditor extends HTMLElement {
  constructor(){
    super();
    this.attachShadow({mode:'open'});
    this._cfg={};
    this._hass=null;
    this._editIdx=null;
    this._yamlMode=false;
    this._evEditIdx=null;
    this._evYamlMode=false;
    this._mainEditing=false;
    this._gsPending=null;
    this._gfPending=null;
    this._evSrcMode=null;
    this._deSrcMode=null;
    this._deSecSrcMode=null;
  }

  disconnectedCallback(){
    if(this._gfPending){
      this._fire(this._gfPending);
      this._gfPending=null;
    }
    if(this._gsPending){
      this._fire(this._gsPending);
      this._gsPending=null;
    }
  }

  set hass(h){
    this._hass=h;
    this.shadowRoot.querySelectorAll('ha-form').forEach(f=>f.hass=h);
  }

  setConfig(c){
    this._cfg={...c};
    if(this._editIdx===null && this._evEditIdx===null && !this._mainEditing){
      const scroller=this._findScroller();
      const saved=scroller?scroller.scrollTop:null;
      this._render();
      if(scroller!=null&&saved!=null) requestAnimationFrame(()=>{scroller.scrollTop=saved;});
    }
  }

  _findScroller(){
    let node=this;
    while(node){
      const next=node.parentElement||(node.getRootNode&&node.getRootNode().host);
      if(!next) return null;
      if(next.scrollHeight>next.clientHeight+1) return next;
      node=next;
    }
    return null;
  }

  _fire(cfg){
    this._cfg={...cfg};
    this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:this._cfg},bubbles:true,composed:true}));
  }

  _render(){
    if(this._evEditIdx!==null) this._renderEvEdit();
    else if(this._editIdx!==null) this._renderEdit();
    else this._renderMain();
  }

  // ── Main view ───────────────────────────────────────────────────────────────
  _renderMain(){
    const sd=this.shadowRoot;
    const scroller=this._findScroller();
    const savedScroll=scroller?scroller.scrollTop:null;
    const genOpen=sd.getElementById('gen-settings-details')?.open||false;

    // ── Energy Values list ──
    const evEntries=this._cfg.energy_values||[];
    const evRows=evEntries.map((e,i)=>{
      const src=e.entity||(e.template?'Jinja2 Template':'');
      const name=e.label||(this._hass?.states[e.entity]?.attributes?.friendly_name)||src||'…';
      const posLbl=this._posLabel(e.position||'');
      const color=e.color_positive||'';
      return`<div class="erow" data-idx="${i}">
        <div class="handle"><ha-icon icon="mdi:drag-horizontal-variant"></ha-icon></div>
        <ha-icon icon="mdi:flash" style="color:${this._esc(color)};--mdc-icon-size:24px;flex-shrink:0;margin:0 2px"></ha-icon>
        <div class="einfo">
          <span class="ename">${this._esc(name)}</span>
          <span class="esub">${this._esc(posLbl)}${posLbl&&src?' · ':''}${this._esc(src)}</span>
        </div>
        <ha-icon-button class="ibtn" data-evaction="del" data-idx="${i}" title="Delete">
          <ha-icon icon="mdi:close"></ha-icon>
        </ha-icon-button>
        <ha-icon-button class="ibtn" data-evaction="edit" data-idx="${i}" title="Edit">
          <ha-icon icon="mdi:pencil"></ha-icon>
        </ha-icon-button>
      </div>`;
    }).join('');
    const canAddEv=evEntries.length<12;

    // ── Daily Entities list ──
    const dailyEntities=this._cfg.daily_entities||[];
    const deRows=dailyEntities.map((e,i)=>{
      const color=e.color||'';
      const stObj=this._hass?.states[e.entity];
      const sub=e.entity||(e.template?'Jinja2 Template':'');
      const name=e.label||(stObj?.attributes?.friendly_name)||sub||'…';
      const iconEl=e.icon
        ?`<ha-icon icon="${this._esc(e.icon)}" style="color:${this._esc(color)};--mdc-icon-size:24px;flex-shrink:0;margin:0 2px"></ha-icon>`
        :`<ha-state-icon id="dei-${i}" style="color:${this._esc(color)};--mdc-icon-size:24px;flex-shrink:0;margin:0 2px"></ha-state-icon>`;
      return`<div class="erow" data-idx="${i}">
        <div class="handle"><ha-icon icon="mdi:drag-horizontal-variant"></ha-icon></div>
        ${iconEl}
        <div class="einfo">
          <span class="ename">${this._esc(name)}</span>
          <span class="esub">${this._esc(sub)}</span>
        </div>
        <ha-icon-button class="ibtn" data-action="del" data-idx="${i}" title="Delete">
          <ha-icon icon="mdi:close"></ha-icon>
        </ha-icon-button>
        <ha-icon-button class="ibtn" data-action="edit" data-idx="${i}" title="Edit">
          <ha-icon icon="mdi:pencil"></ha-icon>
        </ha-icon-button>
      </div>`;
    }).join('');
    const canAddDe=dailyEntities.length<10;

    sd.innerHTML=`<style>${this._css()}</style>
      <ha-form id="gf"></ha-form>
      <h3 class="section-heading">Energy Values</h3>
      <div class="section-body">
        <ha-sortable id="ev-sortable" handle-selector=".handle">
          <div class="elist">${evRows}</div>
        </ha-sortable>
        ${canAddEv?'<button id="ev-addbtn" class="addbtn" type="button"><ha-icon icon="mdi:plus"></ha-icon>Add Energy Value</button>':''}
      </div>
      <h3 class="section-heading">Additional Values</h3>
      <div class="section-body">
        <ha-sortable id="de-sortable" handle-selector=".handle">
          <div class="elist">${deRows}</div>
        </ha-sortable>
        ${canAddDe?'<button id="de-addbtn" class="addbtn" type="button"><ha-icon icon="mdi:plus"></ha-icon>Add Additional Value</button>':''}
      </div>
      <details class="gen-settings" id="gen-settings-details">
        <summary class="gen-settings-summary"><span>General Settings</span></summary>
        <div class="section-body">
          <ha-form id="gsf"></ha-form>
        </div>
      </details>`;

    // ── Daily Entities: set ha-state-icon properties ──
    dailyEntities.forEach((e,i)=>{
      const si=sd.getElementById('dei-'+i);
      if(si){si.hass=this._hass;si.stateObj=this._hass?.states[e.entity]||null;}
    });

    // ── Global settings form ──
    const form=sd.getElementById('gf');
    if(form){
      form.hass=this._hass;
      form.schema=this._gSchema(this._cfg.entity_sun||'');
      form.data={...this._cfg};
      form.computeLabel=s=>s.label??s.name;

      // Text fields are buffered – no immediate _fire while typing
      const GF_TEXT=new Set(['svg_day','svg_night']);

      const gfFlush=()=>{
        if(!this._gfPending) return;
        const d=this._gfPending; this._gfPending=null;
        // _mainEditing=true: prevents setConfig from re-rendering (keeps DOM stable)
        this._mainEditing=true;
        this._fire(d);
        this._mainEditing=false;
      };

      form.addEventListener('value-changed',ev=>{
        const d={...this._cfg,...ev.detail.value,daily_entities:this._cfg.daily_entities,energy_values:this._cfg.energy_values};
        let modeForced=false;
        if(!d.entity_sun && d.mode==='auto'){d.mode='day';modeForced=true;}

        // Check whether only text fields changed
        const changedKeys=Object.keys(ev.detail.value).filter(k=>ev.detail.value[k]!==this._cfg[k]);
        const onlyText=changedKeys.length>0 && changedKeys.every(k=>GF_TEXT.has(k));

        if(onlyText){
          // Text input: buffer only, no _fire → no setConfig → no re-render → no focus loss
          this._gfPending=d;
        } else {
          // Non-text (entity picker, select): fire immediately
          this._gfPending=null;
          this._mainEditing=true;
          this._fire(d);
          this._mainEditing=false;
          if(modeForced){
            this._renderMain();
          } else {
            form.schema=this._gSchema(this._cfg.entity_sun||'');
          }
        }
      });

      // Focus leaves ha-form → flush buffered text changes
      form.addEventListener('focusout',()=>{
        setTimeout(()=>{
          // activeElement !== form: focus is truly outside ha-form
          if(this._gfPending && this.shadowRoot.activeElement!==form) gfFlush();
        },0);
      });
    }

    // ── Energy Values: sortable ──
    const evSortable=sd.getElementById('ev-sortable');
    if(evSortable){
      evSortable.addEventListener('item-moved',ev=>{
        const{oldIndex,newIndex}=ev.detail;
        const arr=[...(this._cfg.energy_values||[])];
        arr.splice(newIndex,0,arr.splice(oldIndex,1)[0]);
        this._fire({...this._cfg,energy_values:arr});
        this._renderMain();
      });
    }

    // ── Energy Values: delete + edit ──
    sd.querySelectorAll('[data-evaction="del"]').forEach(b=>{
      b.addEventListener('click',()=>{
        const arr=[...(this._cfg.energy_values||[])];
        arr.splice(parseInt(b.dataset.idx),1);
        this._fire({...this._cfg,energy_values:arr});
        this._renderMain();
      });
    });
    sd.querySelectorAll('[data-evaction="edit"]').forEach(b=>{
      b.addEventListener('click',()=>{
        this._evEditIdx=parseInt(b.dataset.idx);
        this._evSrcMode=null;
        this._render();
      });
    });

    // ── Energy Values: add (leerer Eintrag — Quelle wird im Werte-Editor gewählt) ──
    const evAddBtn=sd.getElementById('ev-addbtn');
    if(evAddBtn){
      evAddBtn.addEventListener('click',()=>{
        const arr=[...(this._cfg.energy_values||[])];
        arr.push({entity:'',position:'hidden',label:'',color_positive:'',path_positive:'',color_negative:'',path_negative:'',delay_positive:'',delay_negative:''});
        // Edit-Index vor _fire setzen: setConfig überspringt dann das Re-Render dieser View
        this._evEditIdx=arr.length-1;
        this._evSrcMode=null;
        this._fire({...this._cfg,energy_values:arr});
        this._render();
      });
    }

    // ── Daily Entities: sortable ──
    const deSortable=sd.getElementById('de-sortable');
    if(deSortable){
      deSortable.addEventListener('item-moved',ev=>{
        const{oldIndex,newIndex}=ev.detail;
        const arr=[...(this._cfg.daily_entities||[])];
        arr.splice(newIndex,0,arr.splice(oldIndex,1)[0]);
        this._fire({...this._cfg,daily_entities:arr});
        this._renderMain();
      });
    }

    // ── Daily Entities: delete + edit ──
    sd.querySelectorAll('[data-action="del"]').forEach(b=>{
      b.addEventListener('click',()=>{
        const arr=[...(this._cfg.daily_entities||[])];
        arr.splice(parseInt(b.dataset.idx),1);
        this._fire({...this._cfg,daily_entities:arr});
        this._renderMain();
      });
    });
    sd.querySelectorAll('[data-action="edit"]').forEach(b=>{
      b.addEventListener('click',()=>{
        this._editIdx=parseInt(b.dataset.idx);
        this._deSrcMode=null;
        this._deSecSrcMode=null;
        this._render();
      });
    });

    // ── Daily Entities: add (leerer Eintrag — Quelle wird im Werte-Editor gewählt) ──
    const deAddBtn=sd.getElementById('de-addbtn');
    if(deAddBtn){
      deAddBtn.addEventListener('click',()=>{
        const arr=[...(this._cfg.daily_entities||[])];
        arr.push({entity:'',label:'',icon:'',color:'',secondary_entity:'',secondary_icon:'',col_span:'1-col'});
        // Edit-Index vor _fire setzen: setConfig überspringt dann das Re-Render dieser View
        this._editIdx=arr.length-1;
        this._deSrcMode=null;
        this._deSecSrcMode=null;
        this._fire({...this._cfg,daily_entities:arr});
        this._render();
      });
    }

    // ── General Settings form ──
    const gsForm=sd.getElementById('gsf');
    if(gsForm){
      gsForm.hass=this._hass;
      gsForm.schema=this._gsSchema();
      gsForm.data={
        minmax_min_width:this._cfg.minmax_min_width||'175px',
        flow_height:     this._cfg.flow_height     ||'265px',
        svg_height:      this._cfg.svg_height      ||'',
        gradient_day:    this._cfg.gradient_day    ||'linear-gradient(to bottom,#2A75F6 0%,#FFFFFF 67%,#D5D5D5 100%)',
        gradient_night:  this._cfg.gradient_night  ||'linear-gradient(to bottom,#0A1929 0%,#1A2332 67%,#2C3440 100%)',
        viewbox_width:   this._cfg.viewbox_width   ||'1676',
        viewbox_height:  this._cfg.viewbox_height  ||'2058',
        animation_pause: this._cfg.animation_pause ?? '3.5s',
        show_border:     this._cfg.show_border===true?'show':'hide',
      };
      gsForm.computeLabel=s=>s.label??s.name;

      const gsFlush=()=>{
        if(!this._gsPending) return;
        const d=this._gsPending; this._gsPending=null;
        this._mainEditing=true;
        this._fire(d);
        this._mainEditing=false;
      };
      gsForm.addEventListener('value-changed',ev=>{
        const val={...ev.detail.value};
        if('show_border' in val) val.show_border=val.show_border==='show';
        this._gsPending={...this._cfg,...val};
        if('show_border' in ev.detail.value) gsFlush();
      });
      gsForm.addEventListener('focusout',()=>{
        setTimeout(()=>{if(this._gsPending&&this.shadowRoot.activeElement!==gsForm) gsFlush();},0);
      });
      const genDetails=sd.getElementById('gen-settings-details');
      genDetails.addEventListener('toggle',()=>{if(!genDetails.open) gsFlush();});
    }

    // Restore open state of General Settings details
    const genDetails=sd.getElementById('gen-settings-details');
    if(genDetails&&genOpen) genDetails.open=true;

    if(scroller!=null&&savedScroll!=null) requestAnimationFrame(()=>{scroller.scrollTop=savedScroll;});
  }

  // ── Energy Values edit view ─────────────────────────────────────────────────
  _renderEvEdit(){
    const sd=this.shadowRoot;
    const evEntries=this._cfg.energy_values||[];
    const e={entity:'',template:'',position:'hidden',label:'',color_positive:'',path_positive:'',color_negative:'',path_negative:'',delay_positive:'',delay_negative:'',...evEntries[this._evEditIdx]};
    const srcMode=e.template?'template':(this._evSrcMode||'entity');
    const usedPos=evEntries.map((ev2,i2)=>i2!==this._evEditIdx&&ev2.position!=='hidden'?ev2.position:'').filter(Boolean);
    const yamlLbl=this._hass?.localize('ui.panel.lovelace.editor.edit_card.show_code_editor')||'Code Editor';
    const guiLbl =this._hass?.localize('ui.panel.lovelace.editor.edit_card.show_visual_editor')||'Visual Editor';

    sd.innerHTML=`<style>${this._css()}</style>
      <div class="edit-hdr">
        <div class="back-title">
          <ha-icon-button id="back"><ha-icon icon="mdi:arrow-left"></ha-icon></ha-icon-button>
          <span>Energy Value</span>
        </div>
        <ha-icon-button id="yaml-toggle" title="${this._esc(this._evYamlMode?guiLbl:yamlLbl)}">
          <ha-icon icon="${this._evYamlMode?'mdi:format-list-bulleted':'mdi:code-braces'}"></ha-icon>
        </ha-icon-button>
      </div>
      ${this._evYamlMode
        ?'<ha-yaml-editor id="ye"></ha-yaml-editor>'
        :`<ha-form id="ef-src"></ha-form>
          <div id="ev-entity-wrap" class="${srcMode!=='entity'?'hidden':''}"><ha-form id="ef-entity"></ha-form></div>
          <div id="ev-tpl-wrap" class="${srcMode!=='template'?'hidden':''}"><ha-form id="ef-tpl"></ha-form></div>
          <ha-form id="ef-base"></ha-form>
          <div class="flow-heading-row">
            <h3 class="flow-heading">Positive Animation</h3>
          </div>
          <div class="color-field">
            <div class="cp-swatch no-color" id="swatch-pos"><input type="color" id="picker-pos" class="cp-hidden-input"></div>
            <ha-textfield id="tfield-pos" label="Color (e.g. #64B7F6)" style="flex:1;"></ha-textfield>
          </div>
          <ha-form id="ef-pos"></ha-form>
          <div class="flow-heading-row">
            <h3 class="flow-heading">Negative Animation</h3>
          </div>
          <div class="color-field">
            <div class="cp-swatch no-color" id="swatch-neg"><input type="color" id="picker-neg" class="cp-hidden-input"></div>
            <ha-textfield id="tfield-neg" label="Color (e.g. #64B7F6)" style="flex:1;"></ha-textfield>
          </div>
          <ha-form id="ef-neg"></ha-form>`
      }`;

    sd.getElementById('back').addEventListener('click',()=>{
      this._evYamlMode=false;
      this._evEditIdx=null;
      this._evSrcMode=null;
      this._render();
    });
    sd.getElementById('yaml-toggle').addEventListener('click',()=>{
      this._evYamlMode=!this._evYamlMode;
      this._renderEvEdit();
    });

    if(this._evYamlMode){
      const ye=sd.getElementById('ye');
      if(ye){
        ye.defaultValue=e;
        ye.addEventListener('value-changed',ev=>{
          if(ev.detail.isValid===false) return;
          const arr=[...(this._cfg.energy_values||[])];
          arr[this._evEditIdx]={...ev.detail.value};
          this._fire({...this._cfg,energy_values:arr});
        });
      }
    }else{
      // Helper: merge changed fields into current entry and fire
      const fireUpdate=(changed)=>{
        const arr=[...(this._cfg.energy_values||[])];
        const {hide_value:_hv,...existing}=arr[this._evEditIdx]||{};
        arr[this._evEditIdx]={...existing,...changed};
        this._fire({...this._cfg,energy_values:arr});
      };

      const formBase=sd.getElementById('ef-base');
      if(formBase){
        formBase.hass=this._hass;
        formBase.schema=this._evSchemaBase(usedPos, e.position);
        // entity nur als Kontext für den entity_name-Selector (kein Schema-Feld)
        formBase.data={position:e.position,label:e.label,entity:e.entity};
        formBase.computeLabel=s=>{
          const generic=this._hass?.localize(`ui.panel.lovelace.editor.card.generic.${s.name}`);
          if(generic) return generic;
          const k=_L[s.name];
          return(k&&this._hass?.localize(k))||s.label||s.name;
        };
        formBase.addEventListener('value-changed',ev=>{
          // entity strippen: wird ausschließlich über ef-src/ef-entity geschrieben
          const{entity:_e,...newData}=ev.detail.value;
          fireUpdate(newData);
          formBase.data=ev.detail.value;
          const newUsed=(this._cfg.energy_values||[]).map((ev2,i2)=>i2!==this._evEditIdx&&ev2.position!=='hidden'?ev2.position:'').filter(Boolean);
          formBase.schema=this._evSchemaBase(newUsed, newData.position||'');
        });
      }

      // Wechsel räumt das Feld der anderen Quelle auf (wie ha-glow-card Main Value)
      this._wireSrcSelect(sd,'ef-src','ev-entity-wrap','ev-tpl-wrap',srcMode,m=>{
        this._evSrcMode=m;
        if(m==='entity'){
          fireUpdate({template:''});
          const ft=sd.getElementById('ef-tpl');if(ft)ft.data={template:''};
        }else{
          fireUpdate({entity:''});
          const fe=sd.getElementById('ef-entity');if(fe)fe.data={entity:''};
          const fb=sd.getElementById('ef-base');if(fb)fb.data={...fb.data,entity:''};
        }
      });

      const formEntity=sd.getElementById('ef-entity');
      if(formEntity){
        formEntity.hass=this._hass;
        formEntity.schema=[{name:'entity',required:true,selector:{entity:{}}}];
        formEntity.data={entity:e.entity};
        formEntity.computeLabel=s=>{
          const generic=this._hass?.localize(`ui.panel.lovelace.editor.card.generic.${s.name}`);
          return generic||s.label||s.name;
        };
        formEntity.addEventListener('value-changed',ev=>{
          const v=ev.detail.value.entity||'';
          fireUpdate({entity:v});
          formEntity.data={entity:v};
          // Name-Vorschlag im entity_name-Selector aktuell halten
          if(formBase)formBase.data={...formBase.data,entity:v};
        });
      }

      this._wireTplField(sd,'ef-tpl','template','Jinja2 template (should return a number in W)',e.template,fireUpdate);

      const formPos=sd.getElementById('ef-pos');
      if(formPos){
        formPos.hass=this._hass;
        formPos.schema=this._evSchemaPos();
        formPos.data={path_positive:e.path_positive,delay_positive:e.delay_positive};
        formPos.computeLabel=s=>s.label??s.name;
        formPos.addEventListener('value-changed',ev=>{fireUpdate(ev.detail.value);});
      }

      const formNeg=sd.getElementById('ef-neg');
      if(formNeg){
        formNeg.hass=this._hass;
        formNeg.schema=this._evSchemaNeg();
        formNeg.data={path_negative:e.path_negative,delay_negative:e.delay_negative};
        formNeg.computeLabel=s=>s.label??s.name;
        formNeg.addEventListener('value-changed',ev=>{fireUpdate(ev.detail.value);});
      }

      // Wire color picker + textfield for positive/negative
      [['pos','color_positive'],['neg','color_negative']].forEach(([sfx,key])=>{
        this._wireColorField(sd,sfx,e[key]||'',val=>fireUpdate({[key]:val}));
      });
    }
  }

  // ── Daily Entities edit view ────────────────────────────────────────────────
  _renderEdit(){
    const sd=this.shadowRoot;
    const e={entity:'',template:'',label:'',icon:'',color:'',secondary_entity:'',secondary_template:'',secondary_icon:'',secondary_no_unit:false,col_span:'1-col',...(this._cfg.daily_entities||[])[this._editIdx]};
    const srcMode=e.template?'template':(this._deSrcMode||'entity');
    const secMode=e.secondary_template?'template':(this._deSecSrcMode||'entity');
    const yamlLbl=this._hass?.localize('ui.panel.lovelace.editor.edit_card.show_code_editor')||'Code Editor';
    const guiLbl =this._hass?.localize('ui.panel.lovelace.editor.edit_card.show_visual_editor')||'Visual Editor';

    sd.innerHTML=`<style>${this._css()}</style>
      <div class="edit-hdr">
        <div class="back-title">
          <ha-icon-button id="back"><ha-icon icon="mdi:arrow-left"></ha-icon></ha-icon-button>
          <span>${this._hass?.localize('ui.panel.lovelace.editor.sub-element-editor.types.row')||'Entity Line Editor'}</span>
        </div>
        <ha-icon-button id="yaml-toggle" title="${this._esc(this._yamlMode?guiLbl:yamlLbl)}">
          <ha-icon icon="${this._yamlMode?'mdi:format-list-bulleted':'mdi:code-braces'}"></ha-icon>
        </ha-icon-button>
      </div>
      ${this._yamlMode?'<ha-yaml-editor id="ye"></ha-yaml-editor>'
        :`<ha-form id="df-src"></ha-form>
          <div id="de-entity-wrap" class="${srcMode!=='entity'?'hidden':''}"><ha-form id="df-entity"></ha-form></div>
          <div id="de-tpl-wrap" class="${srcMode!=='template'?'hidden':''}"><ha-form id="df-tpl"></ha-form></div>
          <ha-form id="ef"></ha-form>
          <div class="color-field">
            <div class="cp-swatch no-color" id="swatch-color"><input type="color" id="picker-color" class="cp-hidden-input"></div>
            <ha-textfield id="tfield-color" label="Color (e.g. #64B7F6)" style="flex:1;"></ha-textfield>
          </div>
          <div class="flow-heading-row">
            <h3 class="flow-heading">Optional second value</h3>
          </div>
          <ha-form id="df2-src"></ha-form>
          <div id="de2-entity-wrap" class="${secMode!=='entity'?'hidden':''}"><ha-form id="df2-entity"></ha-form></div>
          <div id="de2-tpl-wrap" class="${secMode!=='template'?'hidden':''}"><ha-form id="df2-tpl"></ha-form></div>
          <ha-form id="ef2"></ha-form>`}`;

    sd.getElementById('back').addEventListener('click',()=>{
      this._yamlMode=false;
      this._editIdx=null;
      this._deSrcMode=null;
      this._deSecSrcMode=null;
      this._render();
    });
    sd.getElementById('yaml-toggle').addEventListener('click',()=>{
      this._yamlMode=!this._yamlMode;
      this._renderEdit();
    });

    if(this._yamlMode){
      const ye=sd.getElementById('ye');
      if(ye){
        ye.defaultValue=e;
        ye.addEventListener('value-changed',ev=>{
          if(ev.detail.isValid===false) return;
          const arr=[...(this._cfg.daily_entities||[])];
          arr[this._editIdx]={...ev.detail.value};
          this._fire({...this._cfg,daily_entities:arr});
        });
      }
    }else{
      // Helper: merge changed fields into current entry and fire
      const fireUpdate=(changed)=>{
        const arr=[...(this._cfg.daily_entities||[])];
        arr[this._editIdx]={...(arr[this._editIdx]||{}),...changed};
        this._fire({...this._cfg,daily_entities:arr});
      };

      const form=sd.getElementById('ef');
      if(form){
        form.hass=this._hass;
        form.schema=this._eSchema();
        // entity nur als Kontext für entity_name/icon-Selector (kein Schema-Feld)
        form.data={label:e.label,icon:e.icon,col_span:e.col_span,entity:e.entity};
        form.computeLabel=s=>{
          const generic=this._hass?.localize(`ui.panel.lovelace.editor.card.generic.${s.name}`);
          if(generic) return generic;
          const k=_L[s.name];
          return(k&&this._hass?.localize(k))||s.label||s.name;
        };
        form.addEventListener('value-changed',ev=>{
          // entity strippen: wird ausschließlich über df-src/df-entity geschrieben
          const{entity:_e,...newData}=ev.detail.value;
          fireUpdate(newData);
          form.data=ev.detail.value;
        });
      }

      // ── Hauptwert: Value Source + Entity/Template ──
      this._wireSrcSelect(sd,'df-src','de-entity-wrap','de-tpl-wrap',srcMode,m=>{
        this._deSrcMode=m;
        if(m==='entity'){
          fireUpdate({template:''});
          const ft=sd.getElementById('df-tpl');if(ft)ft.data={template:''};
        }else{
          fireUpdate({entity:''});
          const fe=sd.getElementById('df-entity');if(fe)fe.data={entity:''};
          if(form)form.data={...form.data,entity:''};
        }
      });

      const dfEntity=sd.getElementById('df-entity');
      if(dfEntity){
        dfEntity.hass=this._hass;
        dfEntity.schema=[{name:'entity',required:true,selector:{entity:{}}}];
        dfEntity.data={entity:e.entity};
        dfEntity.computeLabel=s=>{
          const generic=this._hass?.localize(`ui.panel.lovelace.editor.card.generic.${s.name}`);
          return generic||s.label||s.name;
        };
        dfEntity.addEventListener('value-changed',ev=>{
          const v=ev.detail.value.entity||'';
          fireUpdate({entity:v});
          dfEntity.data={entity:v};
          // Name-/Icon-Vorschlag im Hauptformular aktuell halten
          if(form)form.data={...form.data,entity:v};
        });
      }

      this._wireTplField(sd,'df-tpl','template','Jinja2 template (output shown as-is)',e.template,fireUpdate);

      // ── Zweitwert: Value Source + Entity/Template ──
      this._wireSrcSelect(sd,'df2-src','de2-entity-wrap','de2-tpl-wrap',secMode,m=>{
        this._deSecSrcMode=m;
        if(m==='entity'){
          fireUpdate({secondary_template:''});
          const ft=sd.getElementById('df2-tpl');if(ft)ft.data={secondary_template:''};
        }else{
          fireUpdate({secondary_entity:''});
          const fe=sd.getElementById('df2-entity');if(fe)fe.data={...fe.data,secondary_entity:''};
        }
      });

      const df2Entity=sd.getElementById('df2-entity');
      if(df2Entity){
        df2Entity.hass=this._hass;
        df2Entity.schema=[
          {name:'secondary_entity',label:'Entity',selector:{entity:{}}},
          {name:'secondary_no_unit',label:'Hide unit',selector:{boolean:{}}},
        ];
        df2Entity.data={secondary_entity:e.secondary_entity,secondary_no_unit:e.secondary_no_unit||false};
        df2Entity.computeLabel=s=>s.label??s.name;
        df2Entity.addEventListener('value-changed',ev=>{
          fireUpdate(ev.detail.value);
          df2Entity.data=ev.detail.value;
        });
      }

      this._wireTplField(sd,'df2-tpl','secondary_template','Jinja2 template (output shown as-is)',e.secondary_template,fireUpdate);

      const form2=sd.getElementById('ef2');
      if(form2){
        form2.hass=this._hass;
        form2.schema=[{name:'secondary_icon',label:'Icon',selector:{icon:{}}}];
        form2.data={secondary_icon:e.secondary_icon};
        form2.computeLabel=s=>s.label??s.name;
        form2.addEventListener('value-changed',ev=>{
          fireUpdate(ev.detail.value);
          form2.data=ev.detail.value;
        });
      }

      // Wire color picker + textfield
      this._wireColorField(sd,'color',e.color||'',val=>fireUpdate({color:val}));
    }
  }

  // ── Schemas ────────────────────────────────────────────────────────────────
  _gSchema(entitySun=''){
    return[
      {name:'svg_day',   label:'Background Day (SVG Path)',   selector:{text:{}}},
      {name:'svg_night', label:'Background Night (SVG Path)', selector:{text:{}}},
      {name:'mode',label:'display mode',selector:{select:{options:[
        {value:'auto',  label:'Auto (sun necessary)', disabled:!entitySun},
        {value:'day',   label:'Day'},
        {value:'night', label:'Night'},
      ]}}},
      {name:'entity_sun',label:'Sun Entity (for auto mode)',selector:{entity:{}}},
    ];
  }

  _evSchemaBase(usedPositions=[], currentPos=''){
    return[
      {name:'position', label:'Position', required:true, selector:{select:{options:
        PILL_POSITIONS.map(p=>({value:p.value,label:p.label,disabled:p.value!=='hidden'&&p.value!==currentPos&&usedPositions.includes(p.value)}))
      }}},
      {name:'label', selector:{entity_name:{}}, context:{entity:'entity'}},
    ];
  }
  _evSchemaPos(){
    return[
      {name:'path_positive',  label:'SVG Stroke',                                  selector:{text:{multiline:true}}},
      {name:'delay_positive', label:'Animation Delay (e.g. -0.8s)',  selector:{text:{}}},
    ];
  }
  _evSchemaNeg(){
    return[
      {name:'path_negative',  label:'SVG Stroke',                                  selector:{text:{multiline:true}}},
      {name:'delay_negative', label:'Animation Delay (e.g. -0.8s)',       selector:{text:{}}},
    ];
  }

  _eSchema(){
    return[
      {name:'label',    selector:{entity_name:{}}, context:{entity:'entity'}},
      {name:'icon',     selector:{icon:{}},        context:{icon_entity:'entity'}},
      {name:'col_span', label:'Width', selector:{select:{options:[
        {value:'1-col',label:'Half Width (1 Column)'},
        {value:'2-col',label:'Full Width (2 Columns)'},
      ]}}},
    ];
  }

  _gsSchema(){
    return[
      {name:'minmax_min_width',label:'Grid Breakpoint (e.g. 175px)',                                              selector:{text:{}}},
      {name:'flow_height',     label:'Flow Area Height (e.g. 265px)',                                             selector:{text:{}}},
      {name:'svg_height',      label:'SVG Height, centered (e.g. 220px, leave empty to fill)',                   selector:{text:{}}},
      {name:'gradient_day',    label:'Background Gradient Day (e.g. linear-gradient(to bottom,#2A75F6 0%,...))',  selector:{text:{}}},
      {name:'gradient_night',  label:'Background Gradient Night (e.g. linear-gradient(to bottom,#0A1929 0%,...))',selector:{text:{}}},
      {name:'viewbox_width',   label:'SVG ViewBox Width (e.g. 1676)',                                             selector:{text:{}}},
      {name:'viewbox_height',  label:'SVG ViewBox Height (e.g. 2058)',                                            selector:{text:{}}},
      {name:'animation_pause', label:'Animation Duration (e.g. 3.5s)',                                           selector:{text:{}}},
      {name:'show_border',     label:'Card Border',                                                                selector:{select:{options:[{value:'hide',label:'No border'},{value:'show',label:'Show border'}]}}},
    ];
  }

  _posLabel(pos){
    const m=PILL_POSITIONS.find(p=>p.value===pos);
    return m?m.label:pos;
  }

  // Verdrahtet ein "Value Source"-Box-Select, das Entity-/Template-Wrap umschaltet
  _wireSrcSelect(sd,srcId,entityWrapId,tplWrapId,mode,onChange){
    const f=sd.getElementById(srcId);
    if(!f) return;
    f.hass=this._hass;
    f.schema=[{name:'source',label:'Value Source',selector:{select:{mode:'box',options:[
      {value:'entity',  label:'Entity'},
      {value:'template',label:'Jinja2 template'},
    ]}}}];
    f.data={source:mode};
    f.computeLabel=s=>s.label??s.name;
    f.addEventListener('value-changed',ev=>{
      const m=ev.detail.value.source||'entity';
      sd.getElementById(entityWrapId)?.classList.toggle('hidden',m!=='entity');
      sd.getElementById(tplWrapId)?.classList.toggle('hidden',m!=='template');
      onChange(m);
    });
  }

  // Verdrahtet ein einzelnes Jinja2-Template-Multiline-Feld
  _wireTplField(sd,id,key,label,init,fire){
    const f=sd.getElementById(id);
    if(!f) return;
    f.hass=this._hass;
    f.schema=[{name:key,label,selector:{text:{multiline:true}}}];
    f.data={[key]:init};
    f.computeLabel=s=>s.label??s.name;
    f.addEventListener('value-changed',ev=>{fire({[key]:ev.detail.value[key]||''});});
  }

  _syncSwatch(swatch,picker,color){
    const valid=/^#[0-9a-fA-F]{6}$/i.test(color);
    if(swatch){swatch.style.background=valid?color:'';swatch.classList.toggle('no-color',!valid);}
    if(picker) picker.value=valid?color:'#ffffff';
  }

  // Wires a color square (input[type=color]) + ha-textfield pair by id suffix
  _wireColorField(sd,sfx,init,onChange){
    const picker=sd.getElementById('picker-'+sfx);
    const swatch=sd.getElementById('swatch-'+sfx);
    const tfield=sd.getElementById('tfield-'+sfx);
    this._syncSwatch(swatch,picker,init);
    if(tfield) tfield.value=init;
    picker?.addEventListener('input',ev=>{
      const hex=ev.target.value;
      this._syncSwatch(swatch,null,hex);
      if(tfield) tfield.value=hex;
      onChange(hex);
    });
    tfield?.addEventListener('change',ev=>{
      const val=ev.target.value.trim();
      this._syncSwatch(swatch,picker,val);
      onChange(val);
    });
  }

  _esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

  _css(){
    return`:host{display:block;}
ha-form{--ha-form-grid-padding:0;}
.section-heading{margin:24px 0 8px;font-size:var(--ha-font-size-l,1em);font-weight:500;color:var(--primary-text-color);}
.section-body{padding:0 0 4px;}
.elist{display:flex;flex-direction:column;gap:4px;margin-bottom:8px;}
.erow{display:flex;align-items:center;gap:0;padding:4px 4px 4px 0;background:var(--secondary-background-color);border-radius:var(--ha-border-radius-sm,8px);}
.handle{padding:0 8px;cursor:move;cursor:grab;color:var(--secondary-text-color);flex-shrink:0;}
.handle>*{pointer-events:none;}
.einfo{flex:1;min-width:0;overflow:hidden;padding:0 4px;}
.ename{display:block;font-size:14px;color:var(--primary-text-color);}
.esub{display:block;font-size:12px;color:var(--secondary-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.ibtn{--mdc-icon-button-size:36px;--mdc-icon-size:18px;color:var(--secondary-text-color);flex-shrink:0;}
.hidden{display:none;}
#ef-src,#df-src,#df2-src{display:block;margin-bottom:24px;}
#ev-entity-wrap,#ev-tpl-wrap,#de-entity-wrap,#de-tpl-wrap,#de2-entity-wrap,#de2-tpl-wrap{margin-bottom:24px;}
.addbtn{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;margin-top:4px;padding:10px 16px;background:none;border:1px solid var(--divider-color,rgba(127,127,127,.4));border-radius:var(--ha-border-radius-sm,8px);color:var(--primary-color);font-size:14px;font-weight:500;font-family:inherit;cursor:pointer;}
.addbtn:hover{background:rgba(127,127,127,.08);}
.addbtn ha-icon{--mdc-icon-size:18px;}
.edit-hdr{display:flex;justify-content:space-between;align-items:center;padding-bottom:8px;}
.back-title{display:flex;align-items:center;gap:4px;font-size:var(--ha-font-size-l,1.1em);font-weight:500;}
.flow-heading-row{display:flex;align-items:center;gap:8px;margin:16px 0 4px;}
.flow-heading{margin:0;font-size:var(--ha-font-size-l,1em);font-weight:500;color:var(--primary-text-color);}
.color-field{display:flex;gap:8px;align-items:center;margin:4px 0 8px;}
.cp-swatch{width:36px;height:36px;flex-shrink:0;border-radius:4px;border:1px solid var(--divider-color,rgba(0,0,0,0.12));cursor:pointer;position:relative;overflow:hidden;}
.cp-swatch.no-color{background:repeating-linear-gradient(-45deg,rgba(120,120,120,0.5) 0px,rgba(120,120,120,0.5) 4px,transparent 4px,transparent 8px);}
.cp-hidden-input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;padding:0;border:none;}
details.gen-settings{margin-top:28px;}
details.gen-settings>summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:8px;padding:4px 0;user-select:none;}
details.gen-settings>summary::-webkit-details-marker{display:none;}
details.gen-settings>summary::before{content:"▶";font-size:10px;color:var(--secondary-text-color);transition:transform .2s;flex-shrink:0;}
details[open].gen-settings>summary::before{transform:rotate(90deg);}
.gen-settings-summary span{font-size:var(--ha-font-size-l,1em);font-weight:500;color:var(--primary-text-color);}
details.gen-settings .section-body{padding-top:8px;}`;
  }
}

customElements.define('energy-flow-card-editor',EnergyFlowCardEditor);

// ════════════════════════════════════════════════════════════════════════════
class EnergyFlowCard extends HTMLElement {
  static getConfigElement(){return document.createElement('energy-flow-card-editor');}
  static getStubConfig(){
    return{svg_day:'',svg_night:'',mode:'day',energy_values:[],daily_entities:[]};
  }
  constructor(){
    super();this.attachShadow({mode:'open'});
    this._cfg={};this._hass=null;this._ok=false;
    this._prevStates=null;this._lastNight=undefined;this._prevStateObjs={};this._evDirs={};this._watchIds=[];
    this._tpl={};this._tplVals={};
    this._animEpoch=null;this._evDelayAdj={};this._evAnimOn={};
  }
  setConfig(c){this._cfg=c;this._watchIds=this._calcWatchIds();this._ok=false;this._prevStates=null;this._lastNight=undefined;this._prevStateObjs={};this._evDirs={};this._animEpoch=null;this._evDelayAdj={};this._evAnimOn={};this._build();this._syncTplSubs();}
  set hass(h){const first=!this._hass&&h;this._hass=h;if(first)this._syncTplSubs();if(this._ok&&this._hasRelevantChange())this._upd();}
  connectedCallback(){
    // disconnectedCallback baut Subscriptions ab → nach DOM-Move/Tab-Wechsel neu aufbauen.
    // Re-Attach startet alle CSS-Animationen gleichzeitig neu → Delay-Epoch mit zurücksetzen
    this._animEpoch=null;this._evDelayAdj={};this._evAnimOn={};
    if(this._ok&&this._hass){this._syncTplSubs();this._upd();}
  }
  disconnectedCallback(){
    Object.keys(this._tpl).forEach(k=>this._unsubTpl(k));
  }
  _syncTplSubs(){
    if(!this._hass?.connection) return;
    const want={};
    this._getEnergyValues().forEach((e,i)=>{if(e.template)want['ev'+i]=e.template;});
    this._getDailyEntities().forEach((e,i)=>{
      if(e.template)want['de'+i]=e.template;
      if(e.secondary_template)want['ds'+i]=e.secondary_template;
    });
    Object.keys(this._tpl).forEach(k=>{if(!want[k])this._unsubTpl(k);});
    Object.keys(want).forEach(k=>this._subTpl(k,want[k]));
  }
  _unsubTpl(key){
    const t=this._tpl[key];
    if(t?.unsub)t.unsub();
    // Slot immer leeren (active + token): ein noch laufendes Subscribe erkennt
    // am fehlenden Token, dass es veraltet ist, und räumt sich selbst ab
    this._tpl[key]={};
    delete this._tplVals[key];
  }
  async _subTpl(key,template){
    if(template===this._tpl[key]?.active) return;
    this._unsubTpl(key);
    const token={};
    this._tpl[key]={active:template,token};
    try{
      const unsub=await this._hass.connection.subscribeMessage(msg=>{
        if(msg.result!==undefined){
          this._tplVals[key]=String(msg.result).trim();
          if(this._ok)this._upd();
        }else if(msg.error){
          console.error('energy-flow-card template ('+key+'):',msg.error);
        }
      },{type:'render_template',template,variables:{},report_errors:true});
      if(this._tpl[key]?.token===token) this._tpl[key].unsub=unsub;
      else unsub();
    }catch(err){
      console.error('energy-flow-card: template subscription ('+key+') failed',err);
      if(this._tpl[key]?.token===token) this._tpl[key].active=null;
    }
  }
  _calcWatchIds(){
    const c=this._cfg,eids=new Set();
    if(c.entity_sun)eids.add(c.entity_sun);
    (c.energy_values||[]).forEach(e=>{if(e.entity)eids.add(e.entity);});
    (c.daily_entities||[]).forEach(e=>{if(e.entity)eids.add(e.entity);if(e.secondary_entity)eids.add(e.secondary_entity);});
    return[...eids];
  }
  _hasRelevantChange(){
    const h=this._hass,eids=this._watchIds;
    const prev=this._prevStates;
    let changed=!prev;
    if(prev){for(let j=0;j<eids.length;j++){if(h.states[eids[j]]?.state!==prev[eids[j]]){changed=true;break;}}}
    if(changed){const ns={};eids.forEach(eid=>{ns[eid]=h.states[eid]?.state;});this._prevStates=ns;}
    return changed;
  }
  getCardSize(){return this._hasD()?8:5;}

  _hasD(){return(this._cfg.daily_entities||[]).length>0;}
  _getDailyEntities(){return this._cfg.daily_entities||[];}
  _getEnergyValues(){return this._cfg.energy_values||[];}

  _night(){
    const c=this._cfg,m=c.mode||'auto';
    if(m==='day') return false;
    if(m==='night') return true;
    if(!c.entity_sun) return false;
    return this._hass?.states[c.entity_sun]?.state==='below_horizon';
  }
  _num(e,f=0){if(!e||!this._hass)return f;const v=parseFloat(this._hass.states[e]?.state);return isNaN(v)?f:v;}
  _fmtW(v){return Math.abs(v)>=1000?(v/1000).toFixed(2)+' kW':Math.round(v)+' W';}
  _fmtVal(eid,hideUnit=false){
    const st=this._hass?.states[eid];
    const raw=st?.state??'';
    const num=parseFloat(raw);
    const unit=hideUnit?'':(st?.attributes?.unit_of_measurement||'');
    const isFloat=!isNaN(num)&&raw.trim()!==''&&raw.includes('.')&&isFinite(Number(raw));
    return(isFloat?num.toFixed(2):raw)+(unit?' '+unit:'');
  }
  _set(id,t){const el=this.shadowRoot.getElementById(id);if(el&&el.textContent!==t)el.textContent=t;}
  _esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

  _build(){
    const sd=this.shadowRoot,d=this._hasD();
    const ev=this._getEnergyValues();

    // Generate SVG path groups for each energy value
    const pathGroups=ev.map((e,i)=>this._pg('lev'+i,e.path_positive||'')).join('');

    // Generate pills
    const pills=ev.map((e,i)=>{
      if(e.position==='hidden'||!e.position) return '';
      const pos=PILL_POS_CSS[e.position]||'left:12px;top:12px;';
      return`<div class="pill" id="pill-ev-${i}" style="${pos}">
        <span class="pt">${this._esc(e.label||'')}</span>
        <span class="pv" id="v-ev-${i}">\u2013</span>
      </div>`;
    }).join('');

    sd.innerHTML=
      '<style>'+this._css()+'</style>'+
      '<ha-card id="card"><div class="wrap" id="wrap">'+
        '<div class="flow">'+
          '<img id="bg" class="bg">'+
          '<svg class="lines" viewBox="0 0 '+this._esc(this._cfg.viewbox_width||'1676')+' '+this._esc(this._cfg.viewbox_height||'2058')+'" preserveAspectRatio="xMidYMid meet">'+
            this._defs(ev)+pathGroups+
          '</svg>'+
          '<div class="pills">'+pills+'</div>'+
        '</div>'+
        (d?this._dailyH():'')+
      '</div></ha-card>'+
      '<style id="as"></style>';

    // Click handlers: open more-info
    ev.forEach((e,i)=>{
      const el=sd.getElementById('pill-ev-'+i);
      if(el&&e.entity) el.addEventListener('click',()=>{
        this.dispatchEvent(new CustomEvent('hass-more-info',{detail:{entityId:e.entity},bubbles:true,composed:true}));
      });
    });

    this._ok=true;this._upd();
  }

  _pg(cls,d){const dd=this._esc(d);return'<g class="ln '+cls+'">'+Array.from({length:10},(_,i)=>'<path class="p'+i+'" d="'+dd+'" fill="none"/>').join('')+'</g>';}

  _dailyH(){
    const entities=this._getDailyEntities();
    const rows=entities.map((e,i)=>{
      const label=this._esc(e.label||e.entity||'');
      const color=this._esc(e.color||'');
      const showSub=!!(e.secondary_entity||e.secondary_template);
      const col2=e.col_span==='2-col';
      const vid='de-'+i, sid='ds-'+i;
      const iconEl=e.icon
        ?'<ha-icon icon="'+this._esc(e.icon)+'" style="--mdc-icon-size:22px;color:'+color+';flex-shrink:0"></ha-icon>'
        :'<ha-state-icon id="di-'+i+'" style="--mdc-icon-size:22px;color:'+color+';flex-shrink:0"></ha-state-icon>';
      let inner;
      if(showSub){
        const pre=e.secondary_icon
          ?'<ha-icon icon="'+this._esc(e.secondary_icon)+'" style="--mdc-icon-size:11px;opacity:.55;vertical-align:baseline;position:relative;top:-1px;margin-right:2px"></ha-icon>'
          :'';
        inner='<div class="er">'+
          '<span class="ev" id="'+vid+'">\u2013</span>'+
          '<span class="esb">'+pre+'<span id="'+sid+'">\u2013</span></span>'+
          '</div>';
      }else{
        inner='<span class="ev" id="'+vid+'">\u2013</span>';
      }
      return'<div class="ep"'+(col2?' style="grid-column:1/-1"':'')+'>'+
        iconEl+
        '<div class="ed"><span class="el">'+label+'</span>'+inner+'</div></div>';
    }).join('');
    const oneColCount=entities.filter(e=>e.col_span!=='2-col').length;
    const spacer=oneColCount%2===1?'<div class="ep ep-sp" style="visibility:hidden"></div>':'';
    return'<div class="daily" id="daily">'+rows+spacer+'</div>';
  }

  _upd(){
    if(!this._ok||!this._hass) return;
    const sd=this.shadowRoot,c=this._cfg,n=this._night();

    // Background
    const bg=sd.getElementById('bg'),src=n?(c.svg_night||''):(c.svg_day||'');
    if(bg&&bg.getAttribute('src')!==src) bg.setAttribute('src',src);
    const card=sd.getElementById('card');
    const wrap=sd.getElementById('wrap');
    if(wrap) wrap.style.background=n
      ?(this._cfg.gradient_night||'linear-gradient(to bottom,#0A1929 0%,#1A2332 67%,#2C3440 100%)')
      :(this._cfg.gradient_day  ||'linear-gradient(to bottom,#2A75F6 0%,#FFFFFF 67%,#D5D5D5 100%)');
    if(card){
      card.style.setProperty('--ha-card-border-width',this._cfg.show_border===true?'1px':'0px');
      card.style.setProperty('--ha-card-border-color','var(--divider-color,rgba(255,255,255,0.12))');
    }

    // Energy values: pills + animations
    const ev=this._getEnergyValues();
    const on=(v,t=15)=>Math.abs(v)>t;
    const pauseRaw=parseFloat(this._cfg.animation_pause);
    const pause=Math.max(0,isNaN(pauseRaw)?3.5:pauseRaw);
    let animCss='';

    if(this._animEpoch==null)this._animEpoch=performance.now();
    ev.forEach((e,i)=>{
      let val;
      if(e.template){const t=parseFloat(this._tplVals['ev'+i]);val=isNaN(t)?0:t;}
      else val=this._num(e.entity);
      this._set('v-ev-'+i,this._fmtW(val));

      // Switch path when direction changes (pos ↔ neg)
      const dir=val>=0?'pos':'neg';
      const dirChanged=dir!==this._evDirs[i];
      if(dirChanged){
        this._evDirs[i]=dir;
        const path=dir==='pos'?(e.path_positive||''):(e.path_negative||e.path_positive||'');
        if(path) sd.querySelectorAll('.lev'+i+' path').forEach(p=>p.setAttribute('d',path));
      }

      const isOn=on(val);
      // Animations-Neustart (Richtungswechsel oder Wiedereinschalten): Der Browser startet
      // die Animation zur Jetzt-Zeit, die konfigurierten Delays staffeln aber nur relativ
      // zum gemeinsamen Start. Delay um die verstrichene Zeit seit Epoch korrigieren →
      // Phase bleibt identisch zu "alle Flows starteten gemeinsam zur Epoch"
      if(isOn&&(dirChanged||!this._evAnimOn[i])){
        const cfgRaw=dir==='pos'?(e.delay_positive||''):(e.delay_negative||e.delay_positive||'');
        const cfgD=parseFloat(cfgRaw);
        const base=isNaN(cfgD)?0:cfgD;
        this._evDelayAdj[i]=(base-(performance.now()-this._animEpoch)/1000).toFixed(3)+'s';
      }
      this._evAnimOn[i]=isOn;

      if(isOn){
        const color=val>=0?e.color_positive:(e.color_negative||e.color_positive||'');
        animCss+=this._dot('lev'+i,color,'ev'+i,this._evDelayAdj[i]||'0s',dir,pause);
      }else{
        animCss+='.lines .lev'+i+' path{stroke:transparent;animation:none;}';
      }
    });

    const as=sd.getElementById('as');
    if(as&&as.textContent!==animCss) as.textContent=animCss;

    // Daily entities
    if(this._hasD()){
      const daily=sd.getElementById('daily');
      if(daily&&n!==this._lastNight){
        this._lastNight=n;
        daily.style.color=n?'white':'#1a1a1a';
        daily.querySelectorAll('.ep:not(.ep-sp)').forEach(ep=>{ep.style.background=n?'rgba(255,255,255,0.08)':'rgba(255,255,255,0.85)';});
      }
      this._getDailyEntities().forEach((e,i)=>{
        if(e.template) this._set('de-'+i,this._tplVals['de'+i]??'–');
        else if(e.entity) this._set('de-'+i,this._fmtVal(e.entity));
        if(e.secondary_template) this._set('ds-'+i,this._tplVals['ds'+i]??'–');
        else if(e.secondary_entity) this._set('ds-'+i,this._fmtVal(e.secondary_entity,e.secondary_no_unit));
        if(!e.icon){
          const si=sd.getElementById('di-'+i);
          if(si){
            const stObj=this._hass?.states[e.entity]||null;
            if(stObj!==this._prevStateObjs['di-'+i]){
              si.hass=this._hass;si.stateObj=stObj;
              this._prevStateObjs['di-'+i]=stObj;
            }
          }
        }
      });
    }
  }

  _dot(cls,color,fid,delay,dir='',pause=1){
    if(!color) return'.lines .'+cls+' path{stroke:transparent;animation:none;}';
    delay=delay||'0s';
    const speed=967,d=20,t=[200,300,400,480,560,640,720,800,880];
    const gap=pause*speed,tot=d+t[8]+gap,sp=(tot/speed).toFixed(2)+'s';
    const kf='kf'+cls.replace(/\W/g,'')+dir;
    const op=[.85,.7,.6,.5,.4,.3,.22,.15,.08],sw=[8.5,8,7.5,7,6.6,6,5.5,5,4.5];
    let r='@keyframes '+kf+'{to{stroke-dashoffset:'+tot+';}}';
    r+='.lines .'+cls+' .p0{stroke:'+color+';stroke-width:9;stroke-linecap:round;stroke-dasharray:'+d+' '+(tot-d)+';opacity:1;filter:url(#glow_'+fid+'_b);animation:'+kf+' '+sp+' linear infinite;animation-delay:'+delay+';}';
    t.forEach((ti,i)=>{r+='.lines .'+cls+' .p'+(i+1)+'{stroke:'+color+';stroke-width:'+sw[i]+';stroke-linecap:round;stroke-dasharray:'+ti+' '+(tot-ti)+';opacity:'+op[i]+';filter:url(#glow_'+fid+');animation:'+kf+' '+sp+' linear infinite;animation-delay:'+delay+';}';});
    return r;
  }

  _defs(ev){
    const g=(id,s)=>'<filter id="glow_'+id+'" x="-50%" y="-50%" width="200%" height="200%">'+
      '<feGaussianBlur in="SourceGraphic" stdDeviation="'+s[0]+'" result="b1"/>'+
      '<feGaussianBlur in="SourceGraphic" stdDeviation="'+s[1]+'" result="b2"/>'+
      '<feGaussianBlur in="SourceGraphic" stdDeviation="'+s[2]+'" result="b3"/>'+
      '<feMerge><feMergeNode in="b3"/><feMergeNode in="b2"/><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
    return'<defs>'+ev.map((_,i)=>g('ev'+i,[12,22,35])+g('ev'+i+'_b',[15,30,50])).join('')+'</defs>';
  }

  _css(){
    const minW=this._cfg.minmax_min_width||'175px';
    const fh=this._cfg.flow_height||'265px';
    const sh=this._cfg.svg_height||'';
    const mediaStyle=sh
      ?'.bg{position:absolute;left:15px;right:15px;width:calc(100% - 30px);height:'+sh+';top:50%;transform:translateY(-50%);object-fit:contain;}'+
        '.lines{position:absolute;left:15px;right:15px;width:calc(100% - 30px);height:'+sh+';top:50%;transform:translateY(-50%);}'
      :'.bg{position:absolute;inset:10px 15px 5px 15px;width:calc(100% - 30px);height:calc(100% - 15px);object-fit:contain;}'+
        '.lines{position:absolute;inset:10px 15px 5px 15px;width:calc(100% - 30px);height:calc(100% - 15px);}';
    return(
    ':host{display:block;}'+
    'ha-card{overflow:hidden;border-radius:16px;padding:0;box-shadow:none;}'+
    '.wrap{width:100%;min-height:100%;}'+
    '.flow{position:relative;width:100%;height:'+fh+';overflow:hidden;}'+
    mediaStyle+
    '.pills{position:absolute;inset:0;pointer-events:none;z-index:2;}'+
    '.pill{position:absolute;background:rgba(0,0,0,.35);border-radius:12px;padding:12px 14px;color:white;font-family:system-ui;pointer-events:auto;cursor:pointer;-webkit-tap-highlight-color:transparent;}'+
    '.pill:hover{background:rgba(0,0,0,.55);}'+
    '.pill:active{background:rgba(0,0,0,.7);}'+
    '.pt{display:block;font-size:12px;opacity:.8;line-height:1.3;}'+
    '.pv{display:block;font-size:18px;font-weight:700;line-height:1.2;margin-top:2px;}'+
    '.lines .ln path{stroke-width:14;stroke-linecap:round;}'+
    '.daily{display:grid;grid-template-columns:repeat(auto-fill,minmax(max('+minW+',calc(50% - 4px)),1fr));gap:8px;padding:8px;transition:color .5s;}'+
    '.ep{border-radius:12px;padding:10px 14px;font-family:system-ui;display:flex;align-items:center;gap:10px;box-shadow:0 1px 4px rgba(0,0,0,.1);transition:background .3s;}'+
    '.ed{display:flex;flex-direction:column;align-items:flex-start;flex:1;min-width:0;overflow:hidden;}'+
    '.el{font-size:11px;opacity:.75;line-height:1.3;width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}'+
    '.er{display:flex;align-items:baseline;gap:6px;overflow:hidden;}'+
    '.ev{font-size:16px;font-weight:700;margin-top:0;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'+
    '.esb{font-size:10px;opacity:.55;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'
  );}
}

customElements.define('energy-flow-card',EnergyFlowCard);
window.customCards=window.customCards||[];
window.customCards.push({type:'energy-flow-card',name:'Energy Flow Card',description:'Animated energy flow with configurable energy value pills'});
console.info('%c ENERGY-FLOW-CARD %c v1.21.0','background:#1976d2;color:#fff;padding:2px 4px;border-radius:3px 0 0 3px','background:#333;color:#fff;padding:2px 4px;border-radius:0 3px 3px 0');
