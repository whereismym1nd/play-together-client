import './gameCard.scss';

export const GameCard = () => {
  return (
    <div className="game__card">
      <div className="game__img">
        <img src="/images/games/game-1.jpg" alt="Game" />
      </div>
      <div className="game__title">
        Игра 1
      </div>
    </div>
  )
}