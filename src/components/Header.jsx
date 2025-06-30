import './Header.css'

function Header({ isEditMode }) {
  return (
    <header className="report-header">
      <h1 contentEditable={isEditMode} suppressContentEditableWarning={true}>
        The Impact of Heatwave Storytelling on Climate Beliefs and Health Risk Perceptions
      </h1>
    </header>
  )
}

export default Header
