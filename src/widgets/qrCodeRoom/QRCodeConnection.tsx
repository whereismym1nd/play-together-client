import QRCode from 'react-qr-code'
import { CONFIG } from '../../shared/config/config';

type QRCodeProps = { value: string };

export const QRCodeConnection = ({ value }: QRCodeProps) => {
  const connectionURL = `${CONFIG.LOCALHOST_URL}/room/${value}/ctrl`;
  return (
    <>
      <QRCode value={connectionURL} size={256} />
      <p>Код комнаты: {value}</p>
    </>
  )
};