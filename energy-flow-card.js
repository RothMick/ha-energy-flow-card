// energy-flow-card.js  v1.20.0

// Constants
const PILL_POSITIONS=[
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
  }

  disconnectedCallback(){
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
    if(this._editIdx===null && this._evEditIdx===null && !this._mainEditing) this._render();
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
    const genOpen=sd.getElementById('gen-settings-details')?.open||false;

    // ── Energy Values list ──
    const evEntries=this._cfg.energy_values||[];
    const evRows=evEntries.map((e,i)=>{
      const name=e.label||(this._hass?.states[e.entity]?.attributes?.friendly_name)||e.entity||'…';
      const posLbl=this._posLabel(e.position||'');
      const color=e.color_positive||'';
      return`<div class="erow" data-idx="${i}">
        <div class="handle"><ha-icon icon="mdi:drag-horizontal-variant"></ha-icon></div>
        <ha-icon icon="mdi:flash" style="color:${this._esc(color)};--mdc-icon-size:24px;flex-shrink:0;margin:0 2px"></ha-icon>
        <div class="einfo">
          <span class="ename">${this._esc(name)}</span>
          <span class="esub">${this._esc(posLbl)}${posLbl&&e.entity?' · ':''}${this._esc(e.entity||'')}</span>
        </div>
        <ha-icon-button class="ibtn" data-evaction="del" data-idx="${i}" title="Delete">
          <ha-icon icon="mdi:close"></ha-icon>
        </ha-icon-button>
        <ha-icon-button class="ibtn" data-evaction="edit" data-idx="${i}" title="Edit">
          <ha-icon icon="mdi:pencil"></ha-icon>
        </ha-icon-button>
      </div>`;
    }).join('');
    const canAddEv=evEntries.length<9;

    // ── Daily Entities list ──
    const dailyEntities=this._cfg.daily_entities||[];
    const deRows=dailyEntities.map((e,i)=>{
      const color=e.color||'';
      const stObj=this._hass?.states[e.entity];
      const name=e.label||(stObj?.attributes?.friendly_name)||e.entity||'…';
      const sub=e.entity||'';
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
        ${canAddEv?'<ha-entity-picker id="ev-addpicker" add-button></ha-entity-picker>':''}
      </div>
      <h3 class="section-heading">Additional Entities</h3>
      <div class="section-body">
        <ha-sortable id="de-sortable" handle-selector=".handle">
          <div class="elist">${deRows}</div>
        </ha-sortable>
        ${canAddDe?'<ha-entity-picker id="de-addpicker" add-button></ha-entity-picker>':''}
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
      let gfPending=null;

      const gfFlush=()=>{
        if(!gfPending) return;
        const d=gfPending; gfPending=null;
        // _mainEditing=true: prevents setConfig from re-rendering (keeps DOM stable)
        this._mainEditing=true;
        this._fire(d);
        this._mainEditing=false;
      };

      form.addEventListener('value-changed',ev=>{
        const d={...this._cfg,...ev.detail.value,daily_entities:this._cfg.daily_entities,energy_values:this._cfg.energy_values};
        const oldMode=this._cfg.mode||'auto';
        if(!d.entity_sun && d.mode==='auto') d.mode='day';
        const modeForced=d.mode==='day' && oldMode==='auto';

        // Check whether only text fields changed
        const changedKeys=Object.keys(ev.detail.value).filter(k=>ev.detail.value[k]!==this._cfg[k]);
        const onlyText=changedKeys.length>0 && changedKeys.every(k=>GF_TEXT.has(k));

        if(onlyText){
          // Text input: buffer only, no _fire → no setConfig → no re-render → no focus loss
          gfPending=d;
        } else {
          // Non-text (entity picker, select): fire immediately
          gfPending=null;
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
          if(gfPending && this.shadowRoot.activeElement!==form) gfFlush();
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
        this._render();
      });
    });

    // ── Energy Values: add picker ──
    const evAddPicker=sd.getElementById('ev-addpicker');
    if(evAddPicker){
      evAddPicker.hass=this._hass;
      evAddPicker.addEventListener('value-changed',ev=>{
        const val=ev.detail.value;
        if(!val) return;
        const arr=[...(this._cfg.energy_values||[])];
        const usedPos=arr.map(e=>e.position).filter(Boolean);
        const firstFree=PILL_POSITIONS.map(p=>p.value).find(p=>!usedPos.includes(p))||'';
        arr.push({entity:val,position:firstFree,label:'',color_positive:'',path_positive:'',color_negative:'',path_negative:'',delay_positive:'',delay_negative:''});
        this._cfg={...this._cfg,energy_values:arr};
        this._evEditIdx=arr.length-1;
        evAddPicker.value='';
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
        this._render();
      });
    });

    // ── Daily Entities: add picker ──
    const deAddPicker=sd.getElementById('de-addpicker');
    if(deAddPicker){
      deAddPicker.hass=this._hass;
      deAddPicker.addEventListener('value-changed',ev=>{
        const val=ev.detail.value;
        if(!val) return;
        const arr=[...(this._cfg.daily_entities||[])];
        const stObj=this._hass?.states[val];
        const autoIcon=stObj?.attributes?.icon||'';
        arr.push({entity:val,label:'',icon:autoIcon,color:'',secondary_entity:'',secondary_icon:'',col_span:'1-col'});
        this._cfg={...this._cfg,daily_entities:arr};
        this._editIdx=arr.length-1;
        deAddPicker.value='';
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
        this._gsPending={...this._cfg,...ev.detail.value};
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
  }

  // ── Energy Values edit view ─────────────────────────────────────────────────
  _renderEvEdit(){
    const sd=this.shadowRoot;
    const evEntries=this._cfg.energy_values||[];
    const e={entity:'',position:'',label:'',hide_value:false,color_positive:'',path_positive:'',color_negative:'',path_negative:'',delay_positive:'',delay_negative:'',...evEntries[this._evEditIdx]};
    const usedPos=evEntries.map((ev2,i2)=>i2!==this._evEditIdx?ev2.position:'').filter(Boolean);
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
        :`<ha-form id="ef-base"></ha-form>
          <div class="flow-heading-row">
            <h3 class="flow-heading">Positive Animation</h3>
            <span class="color-swatch" id="swatch-pos" style="background:${this._esc(e.color_positive||'')}"></span>
          </div>
          <ha-form id="ef-pos"></ha-form>
          <div class="flow-heading-row">
            <h3 class="flow-heading">Negative Animation</h3>
            <span class="color-swatch" id="swatch-neg" style="background:${this._esc(e.color_negative||'')}"></span>
          </div>
          <ha-form id="ef-neg"></ha-form>`
      }`;

    sd.getElementById('back').addEventListener('click',()=>{
      this._evYamlMode=false;
      this._evEditIdx=null;
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
        arr[this._evEditIdx]={...arr[this._evEditIdx],...changed};
        this._fire({...this._cfg,energy_values:arr});
      };

      const formBase=sd.getElementById('ef-base');
      if(formBase){
        formBase.hass=this._hass;
        formBase.schema=this._evSchemaBase(usedPos, e.position);
        formBase.data={entity:e.entity,position:e.position,label:e.label,hide_value:e.hide_value||false};
        formBase.computeLabel=s=>{
          const generic=this._hass?.localize(`ui.panel.lovelace.editor.card.generic.${s.name}`);
          if(generic) return generic;
          const k=_L[s.name];
          return(k&&this._hass?.localize(k))||s.label||s.name;
        };
        formBase.addEventListener('value-changed',ev=>{
          fireUpdate(ev.detail.value);
          // Refresh position dropdown when position changes
          const newUsed=(this._cfg.energy_values||[]).map((ev2,i2)=>i2!==this._evEditIdx?ev2.position:'').filter(Boolean);
          formBase.schema=this._evSchemaBase(newUsed, ev.detail.value.position||'');
        });
      }

      const formPos=sd.getElementById('ef-pos');
      if(formPos){
        formPos.hass=this._hass;
        formPos.schema=this._evSchemaPos();
        formPos.data={color_positive:e.color_positive,path_positive:e.path_positive,delay_positive:e.delay_positive};
        formPos.computeLabel=s=>s.label??s.name;
        formPos.addEventListener('value-changed',ev=>{
          fireUpdate(ev.detail.value);
          const sw=sd.getElementById('swatch-pos');
          if(sw) sw.style.background=ev.detail.value.color_positive||'';
        });
      }

      const formNeg=sd.getElementById('ef-neg');
      if(formNeg){
        formNeg.hass=this._hass;
        formNeg.schema=this._evSchemaNeg();
        formNeg.data={color_negative:e.color_negative,path_negative:e.path_negative,delay_negative:e.delay_negative};
        formNeg.computeLabel=s=>s.label??s.name;
        formNeg.addEventListener('value-changed',ev=>{
          fireUpdate(ev.detail.value);
          const sw=sd.getElementById('swatch-neg');
          if(sw) sw.style.background=ev.detail.value.color_negative||'';
        });
      }
    }
  }

  // ── Daily Entities edit view ────────────────────────────────────────────────
  _renderEdit(){
    const sd=this.shadowRoot;
    const e={entity:'',label:'',icon:'',color:'',secondary_entity:'',secondary_icon:'',col_span:'1-col',...(this._cfg.daily_entities||[])[this._editIdx]};
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
      ${this._yamlMode?'<ha-yaml-editor id="ye"></ha-yaml-editor>':'<ha-form id="ef"></ha-form>'}`;

    sd.getElementById('back').addEventListener('click',()=>{
      this._yamlMode=false;
      this._editIdx=null;
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
      const form=sd.getElementById('ef');
      if(form){
        form.hass=this._hass;
        form.schema=this._eSchema();
        form.data={...e};
        form.computeLabel=s=>{
          const generic=this._hass?.localize(`ui.panel.lovelace.editor.card.generic.${s.name}`);
          if(generic) return generic;
          const k=_L[s.name];
          return(k&&this._hass?.localize(k))||s.label||s.name;
        };
        form.addEventListener('value-changed',ev=>{
          const arr=[...(this._cfg.daily_entities||[])];
          arr[this._editIdx]={...ev.detail.value};
          this._fire({...this._cfg,daily_entities:arr});
        });
      }
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
      {name:'entity',   required:true, selector:{entity:{}}},
      {name:'position', label:'Position', required:true, selector:{select:{options:
        PILL_POSITIONS.map(p=>({value:p.value,label:p.label,disabled:p.value!==currentPos&&usedPositions.includes(p.value)}))
      }}},
      {name:'label', selector:{entity_name:{}}, context:{entity:'entity'}},
      {name:'hide_value', label:'Hide Value', selector:{boolean:{}}},
    ];
  }
  _evSchemaPos(){
    return[
      {name:'path_positive',  label:'SVG Stroke',                                  selector:{text:{multiline:true}}},
      {name:'color_positive', label:'Color (e.g. #64B7F6)',               selector:{text:{}}},
      {name:'delay_positive', label:'Animation Delay (e.g. -0.8s)',  selector:{text:{}}},
    ];
  }
  _evSchemaNeg(){
    return[
      {name:'path_negative',  label:'SVG Stroke',                                  selector:{text:{multiline:true}}},
      {name:'color_negative', label:'Color (e.g. #64B7F6)',               selector:{text:{}}},
      {name:'delay_negative', label:'Animation Delay (e.g. -0.8s)',       selector:{text:{}}},
    ];
  }

  _eSchema(){
    return[
      {name:'entity',           required:true,                     selector:{entity:{}}},
      {name:'label',            selector:{entity_name:{}},         context:{entity:'entity'}},
      {name:'icon',             selector:{icon:{}},                context:{icon_entity:'entity'}},
      {name:'color',            label:'Color (e.g. #64B7F6)',selector:{text:{}}},
      {name:'secondary_entity', label:'Additional Entity (Optional)',selector:{entity:{}}},
      {name:'secondary_icon',   label:'Additional Entity Symbol',  selector:{icon:{}}},
      {name:'secondary_no_unit',label:'Hide unit for additional entity', selector:{boolean:{}}},
      {name:'col_span',         label:'Width',                     selector:{select:{options:[
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
    ];
  }

  _posLabel(pos){
    const m=PILL_POSITIONS.find(p=>p.value===pos);
    return m?m.label:pos;
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
ha-entity-picker{display:block;margin-top:20px}
.edit-hdr{display:flex;justify-content:space-between;align-items:center;padding-bottom:8px;}
.back-title{display:flex;align-items:center;gap:4px;font-size:var(--ha-font-size-l,1.1em);font-weight:500;}
.flow-heading-row{display:flex;align-items:center;gap:8px;margin:16px 0 4px;}
.flow-heading{margin:0;font-size:var(--ha-font-size-l,1em);font-weight:500;color:var(--primary-text-color);}
.color-swatch{display:inline-block;width:18px;height:18px;border-radius:4px;border:1px solid var(--divider-color,rgba(128,128,128,.4));flex-shrink:0;background-image:linear-gradient(45deg,#aaa 25%,transparent 25%,transparent 75%,#aaa 75%),linear-gradient(45deg,#aaa 25%,#fff 25%,#fff 75%,#aaa 75%);background-size:6px 6px;background-position:0 0,3px 3px;}
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
  }
  setConfig(c){this._cfg=c;this._ok=false;this._build();}
  set hass(h){this._hass=h;if(this._ok)this._upd();}
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
  _fmtVal(eid){
    const raw=this._hass?.states[eid]?.state??'';
    const num=parseFloat(raw);
    const unit=this._hass?.states[eid]?.attributes?.unit_of_measurement||'';
    const isFloat=!isNaN(num)&&raw.trim()!==''&&raw.includes('.')&&isFinite(Number(raw));
    return isFloat?num.toFixed(2)+(unit?' '+unit:''):raw+(unit?' '+unit:'');
  }
  _set(id,t){const el=this.shadowRoot.getElementById(id);if(el&&el.textContent!==t)el.textContent=t;}

  _build(){
    const sd=this.shadowRoot,d=this._hasD();
    const ev=this._getEnergyValues();

    // Generate SVG path groups for each energy value
    const pathGroups=ev.map((e,i)=>this._pg('lev'+i,e.path_positive||'')).join('');

    // Generate pills
    const pills=ev.map((e,i)=>{
      if(e.hide_value) return '';
      const pos=PILL_POS_CSS[e.position||'top-left']||'left:12px;top:12px;';
      return`<div class="pill" id="pill-ev-${i}" style="${pos}">
        <span class="pt">${e.label||''}</span>
        <span class="pv" id="v-ev-${i}">\u2013</span>
      </div>`;
    }).join('');

    sd.innerHTML=
      '<style>'+this._css()+'</style>'+
      '<ha-card id="card"><div class="wrap">'+
        '<div class="flow">'+
          '<img id="bg" class="bg">'+
          '<svg class="lines" viewBox="0 0 '+(this._cfg.viewbox_width||'1676')+' '+(this._cfg.viewbox_height||'2058')+'" preserveAspectRatio="xMidYMid meet">'+
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

  _pg(cls,d){return'<g class="ln '+cls+'">'+Array.from({length:10},(_,i)=>'<path class="p'+i+'" d="'+d+'" fill="none"/>').join('')+'</g>';}

  _dailyH(){
    const entities=this._getDailyEntities();
    const rows=entities.map((e,i)=>{
      const label=e.label||e.entity||'';
      const color=e.color||'';
      const showSub=!!e.secondary_entity;
      const col2=e.col_span==='2-col';
      const vid='de-'+i, sid='ds-'+i;
      const iconEl=e.icon
        ?'<ha-icon icon="'+e.icon+'" style="--mdc-icon-size:22px;color:'+color+';flex-shrink:0"></ha-icon>'
        :'<ha-state-icon id="di-'+i+'" style="--mdc-icon-size:22px;color:'+color+';flex-shrink:0"></ha-state-icon>';
      let inner;
      if(showSub){
        const pre=e.secondary_icon
          ?'<ha-icon icon="'+e.secondary_icon+'" style="--mdc-icon-size:11px;opacity:.55;vertical-align:baseline;position:relative;top:-1px;margin-right:2px"></ha-icon>'
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
    if(card) card.style.background=n
      ?(this._cfg.gradient_night||'linear-gradient(to bottom,#0A1929 0%,#1A2332 67%,#2C3440 100%)')
      :(this._cfg.gradient_day  ||'linear-gradient(to bottom,#2A75F6 0%,#FFFFFF 67%,#D5D5D5 100%)');

    // Energy values: pills + animations
    const ev=this._getEnergyValues();
    const on=(v,t=15)=>Math.abs(v)>t;
    let animCss='';

    ev.forEach((e,i)=>{
      const val=this._num(e.entity);
      this._set('v-ev-'+i,this._fmtW(val));

      // Switch path when direction changes (pos ↔ neg)
      const dirKey='_evdir'+i;
      const dir=val>=0?'pos':'neg';
      if(dir!==this[dirKey]){
        this[dirKey]=dir;
        const path=dir==='pos'?(e.path_positive||''):(e.path_negative||e.path_positive||'');
        if(path) sd.querySelectorAll('.lev'+i+' path').forEach(p=>p.setAttribute('d',path));
      }

      if(on(val)){
        const color=val>=0?e.color_positive:(e.color_negative||e.color_positive||'');
        const delay=val>=0?(e.delay_positive||''):(e.delay_negative||'');
        animCss+=this._dot('lev'+i,color,'ev'+i,delay,dir);
      }else{
        animCss+='.lines .lev'+i+' path{stroke:transparent;animation:none;}';
      }
    });

    const as=sd.getElementById('as');
    if(as&&as.textContent!==animCss) as.textContent=animCss;

    // Daily entities
    if(this._hasD()){
      const daily=sd.getElementById('daily');
      if(daily){
        daily.style.color=n?'white':'#1a1a1a';
        daily.querySelectorAll('.ep:not(.ep-sp)').forEach(ep=>{ep.style.background=n?'rgba(255,255,255,0.08)':'rgba(255,255,255,0.85)';});
      }
      this._getDailyEntities().forEach((e,i)=>{
        if(e.entity) this._set('de-'+i,this._fmtVal(e.entity));
        if(e.secondary_entity){
          const raw=this._hass?.states[e.secondary_entity]?.state??'';
          const num=parseFloat(raw);
          const su=e.secondary_no_unit?'':(this._hass?.states[e.secondary_entity]?.attributes?.unit_of_measurement||'');
          const isFloat=!isNaN(num)&&raw.trim()!==''&&raw.includes('.')&&isFinite(Number(raw));
          const formatted=isFloat?num.toFixed(2)+(su?' '+su:''):raw+(su?' '+su:'');
          this._set('ds-'+i,formatted);
        }
        if(!e.icon){
          const si=sd.getElementById('di-'+i);
          if(si){si.hass=this._hass;si.stateObj=this._hass?.states[e.entity]||null;}
        }
      });
    }
  }

  _dot(cls,color,fid,delay,dir=''){
    if(!color) return'.lines .'+cls+' path{stroke:transparent;animation:none;}';
    const d=20,t=[200,300,400,480,560,640,720,800,880],gap=2000,tot=d+t[8]+gap,sp='3s',kf='kf'+cls.replace(/\W/g,'')+dir;
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
    'ha-card{overflow:hidden;border-radius:16px;padding:0;border:none;box-shadow:none;transition:background 1s ease;}'+
    '.wrap{width:100%;}'+
    '.flow{position:relative;width:100%;height:'+fh+';overflow:hidden;}'+
    mediaStyle+
    '.pills{position:absolute;inset:0;pointer-events:none;z-index:2;}'+
    '.pill{position:absolute;background:rgba(0,0,0,.35);backdrop-filter:blur(6px);border-radius:12px;padding:12px 14px;color:white;font-family:system-ui;pointer-events:auto;cursor:pointer;-webkit-tap-highlight-color:transparent;}'+
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
console.info('%c ENERGY-FLOW-CARD %c v1.20.0','background:#1976d2;color:#fff;padding:2px 4px;border-radius:3px 0 0 3px','background:#333;color:#fff;padding:2px 4px;border-radius:0 3px 3px 0');
