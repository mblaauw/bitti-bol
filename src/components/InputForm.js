import { html } from '../htm.js';
import { computed } from 'https://esm.sh/@preact/signals@2.0.1?external=preact';
import { pipelineSteps, formTopic, formMood, formOccasion, formInstruments, formNotes, runPipeline } from '../state.js';

export function InputForm() {
  const isBusy = computed(() => pipelineSteps.value.some(s => s.status === 'active'));
  const handleGenerate = () => {
    const topic = formTopic.value.trim();
    if (!topic || isBusy.value) return;
    runPipeline({ topic, mood: formMood.value, occasion: formOccasion.value, instruments: formInstruments.value, notes: formNotes.value });
  };
  return html`<section class="card">
      <div class="card-header">
        <h2 class="panel-title">New Song</h2>
        <span class="eyebrow">compose</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:13px">
        <div>
          <label class="form-label">Topic <span style="color:var(--accent)">*</span></label>
          <textarea class="form-textarea" value=${formTopic.value} onInput=${e => formTopic.value = e.target.value} placeholder="chitte dandru · mountain love · apple harvest" style="min-height:58px;font-size:15px"></textarea>
          <p class="form-hint">Type in any language — lyrics come back in Seraji Pahari.</p>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div>
            <label class="form-label">Mood</label>
            <input class="form-input" value=${formMood.value} onInput=${e => formMood.value = e.target.value} placeholder="romantic · longing"/>
          </div>
          <div>
            <label class="form-label">Occasion</label>
            <input class="form-input" value=${formOccasion.value} onInput=${e => formOccasion.value = e.target.value} placeholder="wedding · festival"/>
          </div>
        </div>
        <div>
          <label class="form-label">Instruments</label>
          <input class="form-input" value=${formInstruments.value} onInput=${e => formInstruments.value = e.target.value} placeholder="bansuri · dhol · chimta · acoustic guitar"/>
          <p class="form-hint-sm">Base: acoustic guitar, bansuri, dhol, chimta</p>
        </div>
        <div>
          <label class="form-label">Notes</label>
          <textarea class="form-textarea" value=${formNotes.value} onInput=${e => formNotes.value = e.target.value} placeholder="Any extra guidance…" style="min-height:40px;font-size:13.5px"></textarea>
        </div>
      </div>
      <button class="btn btn-primary" style="width:100%;margin-top:16px;padding:11px" onClick=${handleGenerate} disabled=${isBusy.value || !formTopic.value.trim()}>
        ${isBusy.value ? 'Generating…' : html`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:2px"><path d="M5 3l14 9-14 9V3z"/></svg> Generate song`}
      </button>
    </section>`;
}
