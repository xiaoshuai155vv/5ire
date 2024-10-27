import './Spinner.scss';

export default function Spinner({
  size=24,
  className='',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`spinner ${className}`}
      style={{ width: size, height: size }}
    >
      <div style={{ width: size, height: size }} />
      <div style={{ width: size, height: size }} />
      <div style={{ width: size, height: size }} />
      <div style={{ width: size, height: size }} />
    </div>
  );
}
