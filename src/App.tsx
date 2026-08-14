import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';

type Property = { name: string; type: string; required: boolean; privacy: string };
type EventDefinition = { id: string; name: string; owner: string; description: string; properties: Property[]; status: 'ready' | 'draft' };

const initialEvents: EventDefinition[] = [
  {
    id: 'evt-01', name: 'account_created', owner: 'Growth platform', description: 'A person completes account creation and can be reached in lifecycle systems.', status: 'ready',
    properties: [
      { name: 'account_id', type: 'string', required: true, privacy: 'Internal' },
      { name: 'creation_source', type: 'enum', required: true, privacy: 'Internal' },
      { name: 'consent_status', type: 'enum', required: true, privacy: 'Restricted' },
    ],
  },
  {
    id: 'evt-02', name: 'checkout_started', owner: 'Monetization', description: 'A customer enters the purchase flow after choosing an offer.', status: 'ready',
    properties: [
      { name: 'account_id', type: 'string', required: true, privacy: 'Internal' },
      { name: 'plan_id', type: 'string', required: true, privacy: 'Internal' },
      { name: 'offer_context', type: 'string', required: false, privacy: 'Internal' },
    ],
  },
  {
    id: 'evt-03', name: 'checkout_completed', owner: 'Monetization', description: 'A successful purchase is confirmed by the payment provider.', status: 'draft',
    properties: [
      { name: 'account_id', type: 'string', required: true, privacy: 'Internal' },
      { name: 'plan_id', type: 'string', required: true, privacy: 'Internal' },
      { name: 'amount_cents', type: 'integer', required: true, privacy: 'Financial' },
      { name: 'currency', type: 'string', required: false, privacy: 'Internal' },
    ],
  },
  {
    id: 'evt-04', name: 'feature_activated', owner: 'Product analytics', description: 'A customer reaches the first meaningful action inside a feature.', status: 'draft',
    properties: [
      { name: 'account_id', type: 'string', required: true, privacy: 'Internal' },
      { name: 'feature_name', type: 'string', required: true, privacy: 'Internal' },
    ],
  },
];

function App() {
  const [events, setEvents] = useState(initialEvents);
  const [activeId, setActiveId] = useState(initialEvents[2].id);
  const [newProperty, setNewProperty] = useState('');
  const [notice, setNotice] = useState('');
  const activeEvent = events.find((event) => event.id === activeId) ?? events[0];
  const requiredCount = activeEvent.properties.filter((property) => property.required).length;
  const readiness = useMemo(() => {
    const required = activeEvent.properties.filter((property) => property.required);
    const complete = required.filter((property) => property.name && property.type && property.privacy).length;
    return required.length ? Math.round((complete / required.length) * 100) : 0;
  }, [activeEvent]);

  function updateActive(patch: Partial<EventDefinition>) {
    setEvents((current) => current.map((event) => event.id === activeEvent.id ? { ...event, ...patch } : event));
  }

  function toggleRequired(propertyName: string) {
    updateActive({ properties: activeEvent.properties.map((property) => property.name === propertyName ? { ...property, required: !property.required } : property), status: 'draft' });
    setNotice('Contract changed. Run validation before shipping it.');
  }

  function addProperty() {
    const cleaned = newProperty.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    if (!cleaned || activeEvent.properties.some((property) => property.name === cleaned)) return;
    updateActive({ properties: [...activeEvent.properties, { name: cleaned, type: 'string', required: false, privacy: 'Internal' }], status: 'draft' });
    setNewProperty('');
    setNotice(`Added ${cleaned}. Define its meaning before implementation.`);
  }

  function validateContract() {
    updateActive({ status: 'ready' });
    setNotice(`${activeEvent.name} passed the local contract checks.`);
  }

  function exportContract() {
    const payload = JSON.stringify({ event: activeEvent.name, owner: activeEvent.owner, description: activeEvent.description, properties: activeEvent.properties }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeEvent.name}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice('Contract exported as JSON.');
  }

  return (
    <div className="app-shell">
      <header className="topbar">
          <div className="brand-lockup"><span className="brand-mark">DC</span><div><div className="brand-name">Data Contract Studio</div><div className="brand-subtitle">Event definition / team tool</div></div></div>
          <div className="topbar-actions"><span className="saved-state"><i /> Workspace draft</span><button className="button button-dark" onClick={exportContract}>Export contract</button></div>
      </header>

      <div className="intro-band">
        <div><span className="eyebrow">Event definition / handoff</span><h1>Agree on the event before anyone instruments it.</h1></div>
        <p>The contract keeps the definition, owner, privacy boundary, and review state beside the fields that will ship.</p>
      </div>

      <div className="schema-strip" aria-hidden="true"><span>EVENT</span><i /><span>PROPERTIES</span><i /><span>PRIVACY</span><i /><span>HANDOFF</span></div>

      <main className="studio-grid">
        <aside className="event-rail">
          <div className="rail-heading"><span className="eyebrow">Event catalog</span><span className="event-total">{events.length} events</span></div>
          <div className="event-list">
            {events.map((event, index) => (
              <button key={event.id} className={`event-row ${event.id === activeEvent.id ? 'is-active' : ''}`} onClick={() => { setActiveId(event.id); setNotice(''); }}>
                <span className="event-index">{String(index + 1).padStart(2, '0')}</span>
                <span className="event-info"><strong>{event.name}</strong><small>{event.owner}</small></span>
                <span className={`event-status ${event.status}`}>{event.status === 'ready' ? 'OK' : 'DRAFT'}</span>
              </button>
            ))}
          </div>
          <div className="rail-note"><span className="eyebrow">Working rule</span><p>An event is ready when the team can explain what it means, who owns it, and where its data can go.</p></div>
        </aside>

        <section className="contract-panel">
          <div className="contract-heading"><div><span className="eyebrow">Contract / {activeEvent.id}</span><h2>{activeEvent.name}</h2></div><span className={`readiness-badge ${activeEvent.status}`}>{activeEvent.status === 'ready' ? 'Ready for review' : 'Draft'}</span></div>
          <div className="field-group"><label className="eyebrow" htmlFor="event-description">Definition</label><textarea id="event-description" value={activeEvent.description} onChange={(event) => updateActive({ description: event.target.value, status: 'draft' })} rows={3} /></div>
          <div className="owner-line"><span className="eyebrow">Owner</span><strong>{activeEvent.owner}</strong><span className="owner-separator">/</span><span className="eyebrow">Payload version</span><strong>v0.8</strong></div>
          <div className="properties-header"><div><span className="eyebrow">Properties</span><h3>{activeEvent.properties.length} fields / {requiredCount} required</h3></div><span className="mono">click required state to change</span></div>
          <div className="property-table">
            <div className="property-head"><span>Field</span><span>Type</span><span>Privacy</span><span>Required</span></div>
            {activeEvent.properties.map((property) => (
              <div className="property-row" key={property.name}>
                <strong>{property.name}</strong><span className="type-pill">{property.type}</span><span className={`privacy-tag ${property.privacy.toLowerCase()}`}>{property.privacy}</span><button className={`required-toggle ${property.required ? 'is-required' : ''}`} onClick={() => toggleRequired(property.name)} aria-label={`Toggle ${property.name} required`}>{property.required ? 'Yes' : 'No'}</button>
              </div>
            ))}
          </div>
          <div className="add-field"><input value={newProperty} onChange={(event) => setNewProperty(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') addProperty(); }} placeholder="Add a property name" /><button className="button button-light" onClick={addProperty}>Add field</button></div>
          {notice && <div className="notice">{notice}</div>}
        </section>

        <aside className="quality-panel">
          <div className="quality-top"><span className="eyebrow">Review checks</span><span className="check-count">04</span></div>
          <div className="readiness-meter"><div className="meter-ring" style={{ '--readiness': `${readiness}%` } as CSSProperties}><strong>{readiness}%</strong><span>defined</span></div><p>Ready to hand off</p></div>
          <div className="check-list">
            <div className="check-row"><span className="check-icon pass">+</span><span><strong>Meaning is present</strong><small>Definition has a usable sentence.</small></span></div>
            <div className="check-row"><span className="check-icon pass">+</span><span><strong>Owner is assigned</strong><small>A team can answer questions.</small></span></div>
            <div className="check-row"><span className="check-icon pass">+</span><span><strong>Privacy is classified</strong><small>Every field has a boundary.</small></span></div>
            <div className="check-row"><span className={`check-icon ${activeEvent.status === 'ready' ? 'pass' : 'pending'}`}>{activeEvent.status === 'ready' ? '+' : '-'}</span><span><strong>Contract was reviewed</strong><small>{activeEvent.status === 'ready' ? 'Ready to share with engineering.' : 'Run the checks before handoff.'}</small></span></div>
          </div>
          <button className="button button-accent" onClick={validateContract}>Run validation</button>
          <div className="quality-note"><span className="eyebrow">Use it in the room</span><p>Resolve the meaning and boundary while the event is still easy to change.</p></div>
        </aside>
      </main>
    </div>
  );
}

export default App;
