export interface ChangelogEntry {
  version: string
  date: string
  changes: { ru: string; en: string }[]
}

export const changelog: ChangelogEntry[] = [
  {
    version: '0.7.5',
    date: '2026-07-03',
    changes: [
      { ru: 'Убрано мерцание из CRT-фильтров', en: 'Removed flickering from CRT filters' },
      { ru: 'Добавлен mute/unmute: иконка громкости показывает off/min/max, кликабельна, горячая-клавиша M', en: 'Added mute/unmute: volume icon shows off/min/max states, clickable, M hot-key shortcut' },
      { ru: 'Кастомизация размера кассеты в настройках', en: 'Cassette size customization in settings' },
      { ru: 'Исправления графических багов и оптимизация', en: 'Fixed visual bugs and optimizations' },
    ],
  },
  {
    version: '0.7.4',
    date: '2026-06-11',
    changes: [
      { ru: 'Добавлены плавающие кнопки действий в подборках (появляются при скролле)', en: 'Added floating action buttons in playlists (appear on scroll)' },
      { ru: 'Исправлены некоторые баги анимаций и адаптивности', en: 'Fixed some animation and adaptation bugs' },
    ],
  },
  {
    version: '0.7.0',
    date: '2026-06-09',
    changes: [
      { ru: 'Переработан дизайн', en: 'Redesigned UI' },
      { ru: 'CRT-оверлей с настраиваемыми параметрами', en: 'CRT overlay with adjustable parameters' },
      { ru: 'Визуальные эффекты — хроматик-текст, глитч-текст, блоки коррупции', en: 'Visual effects — chromatic text, glitch text, corruption blocks' },
      { ru: 'Настройки эффектов вынесены на страницу Filters, автосохранение, кнопка сброс', en: 'Effect settings moved to Filters page, auto-save, reset button' },
      { ru: 'Исправлены мелкие баги', en: 'Minor bug fixes' },
      { ru: 'Исправлены графические недочёты и адаптивность под мобильные экраны', en: 'Fixed visual issues and mobile screen adaptation' },
    ],
  },
  {
    version: '0.6.0',
    date: '2026-06-03',
    changes: [
      { ru: 'Добавлен LIVE-режим (BETA) с прямым эфиром', en: 'Added LIVE mode (BETA) with live streaming' },
      { ru: 'Настройка шрифтов в плеере', en: 'Font customization in player' },
      { ru: 'Подборки объединены с плеером — переключайтесь между Classic и LIVE', en: 'Tags merged into Player tab — switch between Classic and LIVE' },
      { ru: 'Исправлены некотоыре ошибки адаптации под разные экраны', en: 'Fixed some errors in adaptation to different screens' },
    ],
  },
  {
    version: '0.5.2',
    date: '2026-05-30',
    changes: [
      { ru: 'Улучшена обработка ошибок и адаптация под мобильные браузеры', en: 'Improved error handling and mobile browser adaptation' },
      { ru: 'Настроена интеграция системного медиа-виджета (обложка, управление плеером)', en: 'Integrated system media widget (artwork, player controls)' },
      { ru: 'Исправлен бейдж ON при перезагрузке страницы с активными тегами', en: 'Fixed ON badge not showing after page reload with active tags' },
    ],
  },
  {
    version: '0.5.1',
    date: '2026-05-29',
    changes: [
      { ru: 'Цвета тегов', en: 'Tag colors' },
      { ru: 'Свечение выбранного тега', en: 'Glow effect on selected tag' },
      { ru: 'Бейдж ON в меню при активном режиме подборки', en: 'ON badge in menu when tag mode is active' },
    ],
  },
  {
    version: '0.5.0',
    date: '2026-05-26',
    changes: [
      { ru: 'Подборки по тегам: выбор нескольких тегов, подтверждение, переключение треков', en: 'Tag-based playlist filtering: multi-select tags, confirm, track switching' },
      { ru: 'Клавиатурная навигация в меню', en: 'Keyboard navigation in menu' },
      { ru: 'Клавиатурное управление треками', en: 'Keyboard track control' },
    ],
  },
  {
    version: '0.4.1',
    date: '2026-05-21',
    changes: [
      { ru: 'Плавный переход tilt между idle-анимацией и положением мыши', en: 'Smooth tilt transition between idle animation and mouse position' },
      { ru: 'Добавлена вкладка "Блог изменений" в меню', en: 'Added "Changelog" tab to menu' },
      { ru: 'Добавлена локализация (русский / английский) с переключением в настройках', en: 'Added localization (Russian / English) with language switcher in settings' },
      { ru: 'Добавлена страница настроек', en: 'Added settings page' },
      { ru: 'Добавлена ссылка на мобильное приложение', en: 'Added mobile app download link' },
    ],
  },
]
