export default function MeetingLoadingModal() {
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ textAlign: 'center' }}>
        <p>Đang đọc meeting notes và tạo câu...</p>
        <p className="hint">Vui lòng đợi một chút</p>
      </div>
    </div>
  );
}
