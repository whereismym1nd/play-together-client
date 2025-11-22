import './mainController.scss'

export type Direction = "up" | "down" | "left" | "right";

type MainControllerProps = {
  onDirection?: (direction: Direction) => void;
  onConfirm?: () => void;
};

export const MainController = ({ onDirection, onConfirm }: MainControllerProps = {}) => {
  const handleDirection = (direction: Direction) => () => onDirection?.(direction);
  const handleConfirm = () => onConfirm?.();

  return (
    <div className="dpad">
      <button className="dpad__btn up" onClick={handleDirection("up")} />
      <button className="dpad__btn left" onClick={handleDirection("left")} />
      <button className="dpad__btn center" onClick={handleConfirm} />
      <button className="dpad__btn right" onClick={handleDirection("right")} />
      <button className="dpad__btn down" onClick={handleDirection("down")} />
    </div>

  )
}
