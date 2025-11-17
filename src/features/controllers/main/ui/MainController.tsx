import './mainController.scss'

export const MainController = () => {
  return (
    <div className="dpad">
      <button className="dpad__btn up" />
      <button className="dpad__btn left" />
      <button className="dpad__btn center" />
      <button className="dpad__btn right" />
      <button className="dpad__btn down" />
    </div>

  )
}