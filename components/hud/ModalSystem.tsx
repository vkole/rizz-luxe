export default function ModalSystem({ modals }: { modals: any[] }) {
  if (modals.length === 0) return null;

  return (
    <div className="modal-overlay">
      {modals.map((modal) => (
        <div key={modal.id} className="modal">
          <div className="modal-header">
            <h2>{modal.title}</h2>
            <button className="modal-close">&times;</button>
          </div>
          <div className="modal-content">
            {modal.content}
          </div>
          <div className="modal-footer">
            <button className="modal-btn cancel">Cancel</button>
            <button className="modal-btn confirm">Confirm</button>
          </div>
        </div>
      ))}
    </div>
  );
}
