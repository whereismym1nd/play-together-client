export function getCl(condition?: boolean, conditionTrue?: string, conditionFalse: string = ''): string {
  return condition ? `__${conditionTrue}` : (conditionFalse ? `__${conditionFalse}` : '');
}

export function getClR(className: any): string {
  return className ? className : ''
}

export function getClList(className: string[]): string {
  return className.filter(Boolean).join(' ')
}

export function getRawHtml(element: any) {
  return { __html: element }
}

export function getRandomInRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const _WIDTH_MOBILE = 495;
export const _WIDTH_TABLET = 820;
export const _WIDTH_DESK = 1440;

export function setCookie(name: string, value: any, options: any = {}) {
  options = {
    path: '/',
    ...options
  };
  const date = new Date();
  date.setDate(date.getDate() + 30);

  // if (options.expires instanceof Date) {
  options.expires = date.toUTCString();
  // }

  let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

  for (let optionKey in options) {
    updatedCookie += "; " + optionKey;
    let optionValue = options[optionKey];
    if (optionValue !== true) {
      updatedCookie += "=" + optionValue;
    }
  }

  document.cookie = updatedCookie;
}
export function getCookie(name: string) {
  let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}
export function deleteCookie(name: string) {
  setCookie(name, "", {
    'max-age': -1
  })
}

export function fixWindow(type: boolean) {
  if (type) {
    setTimeout(function () {
      /* Ставим необходимую задержку, чтобы не было «конфликта» в случае, если функция фиксации вызывается сразу после расфиксации (расфиксация отменяет действия расфиксации из-за одновременного действия) */
      if (!document.body.hasAttribute('data-body-scroll-fix')) {
        // Получаем позицию прокрутки
        let scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        // Ставим нужные стили
        document.body.setAttribute('data-body-scroll-fix', scrollPosition.toString()); // Cтавим атрибут со значением прокрутки
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = '-' + scrollPosition + 'px';
        document.body.style.left = '0';
        document.body.style.width = '100%';
      }
    }, 15);
  } else {
    if (document.body.hasAttribute('data-body-scroll-fix')) {
      // Получаем позицию прокрутки из атрибута
      let scrollPosition = document.body.getAttribute('data-body-scroll-fix');
      // Удаляем атрибут
      document.body.removeAttribute('data-body-scroll-fix');
      // Удаляем ненужные стили
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.width = '';
      // Прокручиваем страницу на полученное из атрибута значение
      if (scrollPosition !== null) {
        window.scroll(0, parseInt(scrollPosition));
      }
    }
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Проверяем, поддерживает ли браузер Clipboard API
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      console.log("Текст успешно скопирован в буфер обмена");
      // window.top100Counter.trackEvent('arivegame_promocode_copy');
      // exponea.track('arive_game', {
      //     event_action: 'promocode_copy'
      //      });      

      return true;
    } else {
      // Для браузеров без поддержки Clipboard API
      // Создаем временный текстовый элемент
      const tempTextArea = document.createElement("textarea");
      tempTextArea.value = text;

      // Стилизуем его так, чтобы он был невидимым
      tempTextArea.setAttribute("readonly", "");
      tempTextArea.style.position = "absolute";
      tempTextArea.style.left = "-9999px";

      document.body.appendChild(tempTextArea);
      tempTextArea.select();
      document.execCommand("copy");
      document.body.removeChild(tempTextArea);

      console.log("Текст успешно скопирован в буфер обмена (fallback)");
      // window.top100Counter.trackEvent('arivegame_promocode_copy');
      // exponea.track('arive_game', {
      //     event_action: 'promocode_copy'
      //      }); 
      return true;
    }
  } catch (error) {
    console.error("Ошибка при копировании текста: ", error);
    return false;
  }
}


export function _applyZoom() {
  // не делаем early return — сначала решаем, какой zoom нужен
  const isDesktopWide = window.matchMedia("(min-width: 1920px)").matches;
  const isCoarse = window.matchMedia("(pointer: coarse)").matches;

  // твоя логика вычисления коэффициента
  const coef = getZoomCoef();        // ≈ window.devicePixelRatio или r/2 на ретина
  const candidate = 1 / coef;        // цель по твоей схеме
  let targetZoom = candidate > 1 ? 1 : candidate; // зум >1 не ставим

  // на широких/coarse-устройствах всегда 1
  if (isDesktopWide || isCoarse) {
    targetZoom = 1;
  }

  if (!Number.isFinite(targetZoom) || targetZoom === 1) {
    // вернуться к 100%: удаляем кастомный zoom вообще
    document.body.style.removeProperty("zoom");
  } else {
    // применяем нужный масштаб
    document.body.style.setProperty("zoom", String(targetZoom));
  }

  return targetZoom;
}

function getZoomCoef() {
  const r = window.devicePixelRatio;
  return isRetinaDisplay() ? r / 2 : r
}

function isRetinaDisplay() {
  if (window.matchMedia) {
    const mq = window.matchMedia('only screen and (min-resolution: 2dppx)');
    return mq.matches;
  }
  return false;
}

export const decodeHtml = (html: string) => {
  if (typeof window === 'undefined') return html;
  const t = document.createElement('textarea');
  t.innerHTML = html;
  return t.value;
};


export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (crypto?.getRandomValues?.(new Uint8Array(1))?.[0] ?? Math.random() * 16) & 15;
    const v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
}

export const safeStorage = {
  get(key: string) {
    try { return window.localStorage.getItem(key); } catch { return null; }
  },
  set(key: string, val: string) {
    try { window.localStorage.setItem(key, val); } catch { }
  }
};


export function disableScroll(type: boolean) {
  if (type) {
    window.addEventListener('wheel', preventDefault, { passive: false });
    window.addEventListener('touchmove', preventDefault, { passive: false });
    window.addEventListener('keydown', preventDefaultForKeys, false);
  } else {
    window.removeEventListener('wheel', preventDefault);
    window.removeEventListener('touchmove', preventDefault);
    window.removeEventListener('keydown', preventDefaultForKeys);
  }
}

function preventDefault(e: WheelEvent | TouchEvent) {
  e.preventDefault();
}

function preventDefaultForKeys(e: KeyboardEvent) {
  // стрелки, PageUp/Down, пробел
  const keys = [32, 33, 34, 35, 36, 37, 38, 39, 40];
  if (keys.includes(e.keyCode)) {
    e.preventDefault();
  }
}

export const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export function formatAttempts(count: number | undefined | null): string {
  if (count == null) return "Доступно попыток";

  const n = Math.abs(count) % 100;
  const lastDigit = n % 10;

  let word = "попыток";
  if (!(n > 10 && n < 20)) {
    if (lastDigit === 1) word = "попытка";
    else if (lastDigit >= 2 && lastDigit <= 4) word = "попытки";
  }

  const verb = (lastDigit === 1 && !(n > 10 && n < 20)) ? "Доступна" : "Доступно";

  return `${verb} ${count} ${word}`;
}