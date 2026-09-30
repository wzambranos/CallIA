const steps = ["Cuenta", "Perfil", "Pago"];

export function OnboardingFrame({
  step,
  title,
  children,
}: {
  step: 1 | 2 | 3;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-xl px-5 py-12">
      <p className="text-xs font-semibold tracking-[0.14em] text-pine uppercase">Alta</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
      <ol className="mt-6 flex gap-6 text-sm">
        {steps.map((label, index) => {
          const number = index + 1;
          const active = number === step;
          const done = number < step;
          return (
            <li key={label} className={`flex items-center gap-2 ${active ? "font-medium text-ink" : "text-ink-soft"}`}>
              <span
                className={`grid h-6 w-6 place-items-center rounded-full text-xs ${done || active ? "bg-pine text-white" : "bg-canvas"}`}
              >
                {number}
              </span>
              {label}
            </li>
          );
        })}
      </ol>
      <div className="mt-8">{children}</div>
    </div>
  );
}
