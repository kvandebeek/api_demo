import { useMemo, useState } from 'react';

const buttons = [
  'AC', '(', ')', '/',
  '7', '8', '9', '*',
  '4', '5', '6', '-',
  '1', '2', '3', '+',
  '0', '.', '='
];

const apiBase = (import.meta.env.VITE_API_BASE_URL as string) ?? 'http://localhost:3001';

export function App() {
  const [display, setDisplay] = useState('0');
  const [error, setError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<'equals' | 'input'>('input');

  const debugState = useMemo(() => ({ display, error, lastAction, apiBase }), [display, error, lastAction]);

  const press = async (token: string) => {
    setError(null);
    if (token === 'AC') {
      setDisplay('0');
      setLastAction('input');
      return;
    }

    if (token === '=') {
      if (lastAction === 'equals' && import.meta.env.VITE_BUG_DOUBLE_EQUALS_SHOWS_ERROR === 'true') {
        setDisplay('ERROR');
        setError('Double equals defect triggered');
        setLastAction('input');
        return;
      }

      try {
        const response = await fetch(`${apiBase}/calculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ expression: display })
        });

        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? 'Unknown API error');
        setDisplay(String(payload.result));
        setLastAction('equals');
      } catch (e) {
        setDisplay('ERROR');
        setError((e as Error).message);
      }
      return;
    }

    if (token === '9' && import.meta.env.VITE_BUG_DIGIT_9_DISABLED === 'true') return;

    setDisplay((current) => (current === '0' || current === 'ERROR' ? token : `${current}${token}`));
    setLastAction('input');
  };

  return (
    <main className="screen">
      <section className="calculator">
        <div className="lcd" data-state={error ? 'error' : 'ok'}>{display}</div>
        {error && <div className="error">{error}</div>}
        <div className="keys">
          {buttons.map((label) => (
            <button key={label} className={label === 'AC' ? 'ac' : label === '=' ? 'equals' : ''} onClick={() => void press(label)}>
              {label}
            </button>
          ))}
        </div>
      </section>
      <aside className="telemetry">
        <h2>Telemetry</h2>
        <pre>{JSON.stringify(debugState, null, 2)}</pre>
      </aside>
    </main>
  );
}
