function TicTacToe($area) {
	
	// Контроллер управления игрой
	var controller = Controller();
	
	
	
	// Очередность хода
	var WhoseTurn = {
		// Ход игрока
		Player   : 0,
		// Ход компьютера
		Computer : 1,
		// Ход не возможен
		None     : undefined
	};
	
	// Значения в ячейках таблицы игрового поля
	var GameFieldValue = {
		// Крестик
		Tic  : 1,
		// Нолик
		Toe  : 0,
		// Пустое поле
		None : undefined
	};
	
	
	
	// Контроллер
	function Controller() {
		var layoutView, informationView, gameView, 
			startView, resultView, gameSet, history;
		
		// Конструктор
		function create() {
			// История игр
			history = HistoryModel();

			// Добавить на страницу области отображения
			layoutView = LayoutView($area);
			// Отобразить область выбора пользователя
			startView = StartView(layoutView.$left);
			// Отобразить информационную область 
			informationView = InformationView(layoutView.$right, history);
			
			return {
				onStartGameSet   : onStartGameSet,
				onEndGameSet     : onEndGameSet,
				onReStartGameSet : onReStartGameSet,
				onEndGame        : onEndGame,
				onPlayerMove     : onPlayerMove,
				onComputerMove   : onComputerMove,
				onHistoryClear   : onHistoryClear
			};
		}
		
		// Начало новой игровой серии
		function onStartGameSet(settings) {
			// Начать новую серию игр
			gameSet = GameSetModel(settings);
			// Отобразить
			gameView = GameView(layoutView.$left, gameSet);
			// Выполнить ход компьютера
			if (gameSet.game.whoseTurn === WhoseTurn.Computer)
				gameSet.game.move();
		}
		
		// Конец игровой серии
		function onEndGameSet() {
			// Добавить в историю игр
			history.add(gameSet);
			// Отобразить область результата
			resultView = ResultView(layoutView.$left, gameSet);
			// Перериосвать информационную область
			informationView = InformationView(layoutView.$right, history);
		}
		
		// Начать игру заново
		function onReStartGameSet() {
			this.onStartGameSet(gameSet.settings);
		}
		
		// Признак конца игры
		function onEndGame(strike) {
			// Выделение выигрышных позиций
			gameView.strike(strike);
			
			// Заблокировать игровое поле
			gameView.disable();

			// Дать пользователю осознать ситуцию, и начать новую игру
			setTimeout(function() {
				// Начать новую игру
				if (gameSet.newGame()) {
					// Отобразить новое игровое поле
					gameView = GameView(layoutView.$left, gameSet);
					// Выполнить ход компьютера
					if (gameSet.game.whoseTurn === WhoseTurn.Computer)
						gameSet.game.move();
				}
			}, 1000);
		}
		
		// Ход пользователя
		function onPlayerMove(rowIndex, colIndex) {
			// Выполнить ход компьютера
			if (gameSet.game.move(rowIndex, colIndex)) {
				// Установить крестик/нолик в игровое поле
				gameView.setValue(rowIndex, colIndex, gameSet.game.playerSide);
				// Выполнить ход компьютера
				gameSet.game.move();
			}
		}
		
		// Ход компьютера
		function onComputerMove(rowIndex, colIndex) {
			// Установить крестик/нолик в игровое поле
			gameView.setValue(rowIndex, colIndex, gameSet.game.computerSide);
		}
		
		// Очистка истории
		function onHistoryClear() {
			// Очистить историю
			history.clear();
			// Перериосвать информационную область
			informationView = InformationView(layoutView.$right, history);
		}

		// Инициализация
		return create();
	}
	
	
	
	// Отрисовка областей страницы
	function LayoutView($area) {
		// Конструктор
		function create() {
			// Отобразить область
			__render();
			
			// Сохранить ссылка на области вывода
			return {
				$left  : $area.find('.ttt-left'),
				$right : $area.find('.ttt-right')
			};
		}
		
		// Рисование области
		function __render() {
			// Добавить на страницу области
			var html = new HTMLBuilder();
			html.
				append('<div class="ttt-title">Tic-Tac-Toe</div>').
				append('<div class="ttt-left"></div>').
				append('<div class="ttt-right"></div>').
				append('<div class="ttt-clear"></div>');
			$area.html(html.toString());
		}
		
		// Инициализация
		return create();
	}
	
	// Область выбора параметров игры 
	function StartView($area) {
		// Конструктор
		function create() {
			// Отобразить область
			__render();
			
			// Установить фокус в поле ввода имени
			$area.find('#player-name').focus();
			
			// Навесить обработчики
			$area.find('button').on('click', function() {
				controller.onStartGameSet({
					playerName: $area.find('#player-name').val(),
					whoseTurn:  $area.find('#whose-turn').prop('selectedIndex'),
					gameLevel:  $area.find('#game-level').prop('selectedIndex')
				});
			});
		}
		
		// Рисование области
		function __render() {
			var html = new HTMLBuilder();
			html.
				append('<div class="ttt-start">').
					append('<div class="ttt-banner">').
						append('Добро пожаловать в TicTacToe!!! Чтобы начть игру, выберите параметры и введите свое имя.').
					append('</div>').
					append('<div class="ttt-form">').
						append('<div class="ttt-form-control ttt-form-control--input">').
							append('<label>Имя игрока</label>').
							append('<input type="text" id="player-name" maxlength="15">').
						append('</div>').
						append('<div class="ttt-form-control ttt-form-select">').
							append('<label>Очередность хода</label>').
							append('<select id="whose-turn">').
								append('<option>Ходить первым').
								append('<option>Ходить последним').
							append('</select>').
						append('</div>').
						append('<div class="ttt-form-control ttt-form-control--select">').
							append('<label>Уровень игры</label>').
							append('<select id="game-level">').
								append('<option>Легкий').
								append('<option selected>Сложный').
							append('</select>').
						append('</div>').
					append('</div>').
					append('<div class="ttt-accpet">').
						append('<button>Начать игру</button>').
					append('</div>').
				append('</div>');
			$area.html(html.toString());
		}
		
		// Инициализация
		return create();
	}
	
	// Область вывода результатов игры 
	function ResultView($area, gameSet) {
		// Конструктор
		function create() {
			// Отобразить область
			__render();
			
			// Навесить обработчики
			$area.find('.ttt-resul-restart button').on('click', function() {
				controller.onReStartGameSet();
			});
		}
		
		// Рисование области
		function __render() {
			var message = 'Ничья :|';
			if (gameSet.playerPoints > gameSet.computerPoints) 
				message = 'Вы выиграли :)';
			else if (gameSet.playerPoints < gameSet.computerPoints)
				message = 'Вы проиграли :(';
			
			var html = new HTMLBuilder();
			html.
				append('<div class="ttt-result">').
					append('<div class="ttt-banner">').
						append('<p class="ttt-result-message">').
							append(message).
						append('</p>').
						append('<p class="ttt-result-score">').
							append(gameSet.playerName + ' ').
							append(gameSet.playerPoints).
							append(' : ').
							append(gameSet.computerPoints).
							append(' Компьютер').
						append('</p>').
					append('</div>').
					append('<div class="ttt-resul-restart">').
						append('<button>Начать заново</button>').
					append('</div>').
				append('</div>');
			$area.html(html.toString());
		}
		
		// Инициализация
		return create();
	}
	
	// Информационная область вывода
	function InformationView($area, history) {
		// Конструктор
		function create() {
			// Отобразить область
			__render();
			
			// Обработчик для кнопка очистки
			$area.find('.ttt-history-clear button').on('click', function() {
				controller.onHistoryClear();
			});
		}
		
		// Рисование области
		function __render() {
			var html = new HTMLBuilder();
			html.append('<div class="ttt-history">');

				// Заголовок
				html.
					append('<div class="ttt-history-title">').
						append('Статистика игр').
					append('</div>');
				
				// Лучший результат
				var best = history.best();
				if (best) {
					html.
						append('<div class="ttt-history-best">').
							append('<div class="ttt-history-best-title">').
								append('Лучший результат').
							append('</div>').
							append('<div class="ttt-history-best-content">');
					__appendResult(html, best);
					html.append('</div></div>');
				
					// История
					html.
						append('<div class="ttt-history-data">').
							append('<div class="ttt-history-data-title">').
								append('История игр').
							append('</div>').
							append('<div class="ttt-history-data-content">');
					for (var i = history.games.length - 1; i >= 0; i--)
						__appendResult(html, history.games[i]);
					html.append('</div></div>');
					
					// Очистка истории
					html.
						append('<div class="ttt-history-clear">').
							append('<button>Очистить историю</button>').
						append('</div>');
				}
			
			
			html.append('</div>');
			$area.html(html.toString());
		}
		
		// HTML-код для пердставления результат
		function __appendResult(builder, result) {
			builder.
				append('<div class="ttt-history-item">').
					append('<div class="ttt-history-item-date">').
						append(result.date).
					append('</div>').

					append('<div class="ttt-history-item-value">').
						append('<table>').
							append('<tr>').
								append('<td>').
									append('<span class="ttt-history-item-name">').
										append(result.player).
									append('</span> ').
									append('<span class="ttt-history-item-points">').
										append(result.playerPoints).
									append('</span>').
								append('</td>').
								append('<td>:</td>').
								append('<td>').
									append('<span class="ttt-history-item-points">').
										append(result.computerPoints).
									append('</span> ').
									append('<span class="ttt-history-item-name">').
										append('Компьютер').
									append('</span>').
								append('</td>').
							append('</tr>').
						append('</table>').
					append('</div>').
				append('</div>');
		}
		
		// Инициализация
		return create();
	}
	
	// Игровая область
	function GameView($area, gameSet) {
		// Конструктор
		function create() {
			// Отобразить область
			__render();
			
			// Навесить обработчики
			$area.find('.ttt-game-field table').on('click', '.ttt-game-field-cell--empty', function() {
				// Ячейка таблицы
				var $cell = $(this).parent();

				// Инициировать ход пользователя
				controller.onPlayerMove($cell.find('input.ttt-game-field-cell-row').val() * 1,
					$cell.find('input.ttt-game-field-cell-col').val() * 1);
			});
			
			return {
				setValue : setValue,
				strike   : strike,
				disable  : disable
			};
		}
		
		// Заблокировать игровое поле
		function disable() {
			$area.find('.ttt-game-field-cell')
				.removeClass('ttt-game-field-cell--empty')
				.addClass('ttt-game-field-cell--disabled');
		}
		
		// Установить крестик/нолик в игровое поле
		function setValue(rowIndex, colIndex, value) {
			// Определить ячейку таблицы
			var $cell = $area.find('.ttt-game-field-row-' + rowIndex)
				.find('.ttt-game-field-col-' + colIndex);
			// Выделить соответсвующую ячейку
			$cell.find('.ttt-game-field-cell')
				.removeClass('ttt-game-field-cell--empty')
				.html(__mark(value));
		}
		
		// Выделение выигрышных позиций 
		function strike(strike) {
			var $cell;
			if (strike) {
				for (var i = 0; i < strike.length; i++) {
					// Определить ячейку таблицы
					$cell = $area.find('.ttt-game-field-row-' + strike[i].rowIndex)
						.find('.ttt-game-field-col-' + strike[i].colIndex);
					// Выделить соответсвующую ячейку
					$cell.find('.ttt-game-field-cell').addClass('ttt-game-field-cell--done');
				}
			}
		}
		
		// Определение устанавливаемого знака по значению поля
		function __mark(value) {
			return (value === GameFieldValue.Tic ? 'X' : 'O');
		}
		
		// Рисование области
		function __render() {
			var html = new HTMLBuilder();
			html.
				append('<div class="ttt-game">').
					append('<div class="ttt-game-score">').
						append('<table>').
							append('<tr>').
								append('<td class="ttt-game-score-player">').
									append('<span class="ttt-game-score-name">').
										append(gameSet.playerName).
									append('</span> ').
									append('<span class="ttt-game-score-side">(').
										append(__mark(gameSet.game.playerSide)).
									append(')</span><br>').
									append('<span class="ttt-game-score-value">').
										append(gameSet.playerPoints).
									append('</span>').
								append('</td>').
								append('<td>').
									append('<span class="ttt-game-score-splitter">:</span>').
								append('</td>').
								append('<td class="ttt-game-score-computer">').
									append('<span class="ttt-game-score-name">').
										append('Компьютер').
									append('</span> ').
									append('<span class="ttt-game-score-side">(').
										append(__mark(gameSet.game.computerSide)).
									append(')</span><br>').
									append('<span class="ttt-game-score-value">').
										append(gameSet.computerPoints).
									append('</span>').
								append('</td>').
							append('</tr>').
						append('</table>').
					append('</div>');
			
			html.append('<div class="ttt-game-field">');
			html.append('<table>');
			for (var r = 0; r < 3; r++) {
				html.append('<tr class="ttt-game-field-row-' + r + '">');
				for (var c = 0; c < 3; c++) {
					html.append('<td class="ttt-game-field-col-' + c + '">');
						html.append('<input type="hidden" class="ttt-game-field-cell-row" value="' + r + '">');
						html.append('<input type="hidden" class="ttt-game-field-cell-col" value="' + c + '">');
						html.append('<div class="ttt-game-field-cell ttt-game-field-cell--empty"></div>');
					html.append('</td>');
				}
				html.append('</tr>');
			}
			html.append('</table>');
			html.append('</div>');
			
			html.append('</div>');
			$area.html(html.toString());
		}
		
		// Инициализация
		return create();
	}
	
	
	
	// Данные серии игр
	function GameSetModel(settings) {
		// Максимальное количество игр
		var GAMES_LIMIT = 10;
		// Общее количество прошедших игр
		var __gamesCount;
		// Очередь хода (первый ставит крестики)
		var __whoseTurn;
		// Модель компьютера
		var __computer;
		
		// Конструктор
		function create() {
			// Создаваемый объект
			var object = {
				newGame: newGame,
				playerName: settings.playerName || 'NoName',
				playerPoints: 0,
				computerPoints: 0,
				settings: settings
			};
			
			// Начальное значение для прошедших игр
			__gamesCount = 0;
			// Установить очередь для первой игры
			__whoseTurn = settings.whoseTurn;
			// Создать модель компьютера
			__computer = Computer(settings.gameLevel);
			
			// Начать новую игру
			object.newGame();
			
			return object;
		}
		
		// Модель игры компьютера
		function Computer(gameLevel) {
			// Конструктор
			function create() {
				return {
					move: (gameLevel ? Strong() : __weakStrategy)
				};
			}
			
			// Поиск первой покавшейся пустой клетки
			function __findNone(field) {
				for (var r = 0; r < 3; r++)
					for (var c = 0; c < 3; c++)
						if (__checkNone(field[r][c]))
							return { rowIndex: r, colIndex: c };
			}
			
			// Проверка поля на пустоту
			function __checkNone(cell) {
				return (cell === GameFieldValue.None);
			}
			
			// Проверка возможности выиграть или не проиграть
			function __checkWinLoss(field, value) {
				var position;
				var counter = 0;
				
				// По горизонтали
				for (var r = 0; r < 3; r++) {
					counter = 0;
					position = -1;
					for (var c = 0; c < 3; c++) {
						if (field[r][c] === value)
							counter++;
						else
							position = c;
					}
					if ((counter === 2) && (__checkNone(field[r][position]))) {
						return {
							rowIndex: r,
							colIndex: position
						};
					}
				}
				
				// По вертикали
				for (var c = 0; c < 3; c++) {
					counter = 0;
					position = -1;
					for (var r = 0; r < 3; r++) {
						if (field[r][c] === value)
							counter++;
						else
							position = r;
					}
					if ((counter === 2) && (__checkNone(field[position][c]))) {
						return {
							rowIndex: position,
							colIndex: c
						};
					}
				}
				
				// Левая диагональ
				if ((field[0][0] === field[1][1]) && (field[1][1] === value) && __checkNone(field[2][2]))
					return { rowIndex: 2, colIndex: 2 };
				if ((field[0][0] === field[2][2]) && (field[2][2] === value) && __checkNone(field[1][1]))
					return { rowIndex: 1, colIndex: 1 };
				if ((field[1][1] === field[2][2]) && (field[2][2] === value) && __checkNone(field[0][0]))
					return { rowIndex: 0, colIndex: 0 };

				// Правая диагональ
				if ((field[0][2] === field[1][1]) && (field[1][1] === value) && __checkNone(field[2][0]))
					return { rowIndex: 2, colIndex: 0 };
				if ((field[0][2] === field[2][0]) && (field[2][0] === value) && __checkNone(field[1][1]))
					return { rowIndex: 1, colIndex: 1 };
				if ((field[1][1] === field[2][0]) && (field[2][0] === value) && __checkNone(field[0][2]))
					return { rowIndex: 0, colIndex: 2 };
			
				return null;
			}
			
			// Сильная стратегия
			function Strong() {
				var state = -1;
				var firstRowIndex, firstColIndex;
				return function (game) {
					
					var noneCell;
					var field = game.field;
					var rowIndex = undefined, colIndex = undefined;
					
					if (game.moveCounter === 0) {
						// Первый ход всегда в центр
						rowIndex = 1;
						colIndex = 1;
					} else {
						// Правило 1. Если игрок может немедленно выиграть, он это делает.
						var win = __checkWinLoss(game.field, game.computerSide);
						if (win) {
							rowIndex = win.rowIndex;
							colIndex = win.colIndex;
						} else {
							// Правило 2. Если игрок не может немедленно выиграть, но его противник 
							// мог бы немедленно выиграть, сделав ход в какую-то клетку, игрок сам 
							// делает ход в эту клетку, предотвращая немедленный проигрыш.
							var loss = __checkWinLoss(game.field, game.playerSide);
							if (loss) {
								rowIndex = loss.rowIndex;
								colIndex = loss.colIndex;
							} else {
								if (game.moveCounter % 2 === 0) {
									// Компьютер ходил первым
									// Первый ход сделать в центр. Остальные ходы, если неприменимы правила 1-2, 
									// делаются в тот из свободных углов, который дальше всего от предыдущего 
									// хода ноликов, а если и это невозможно — в любую клетку.
									rowIndex = game.lastPlayerMove.rowIndex;
									colIndex = game.lastPlayerMove.colIndex;
									
									if ((rowIndex % 2 === 0) && (colIndex % 2 === 0)) {
										rowIndex = (rowIndex + 2) % 4;
										colIndex = (colIndex + 2) % 4;
										if (!__checkNone(game.field[2][2])) {
											// ... в любую клетку
											noneCell = __findNone(game.field);
											rowIndex = noneCell.rowIndex;
											colIndex = noneCell.colIndex;
										}
									} else {
										if (rowIndex % 2 === 0) {
											rowIndex = (rowIndex + 2) % 4;
											if (__checkNone(game.field[rowIndex][0]))
												colIndex = 0;
											else if (__checkNone(game.field[rowIndex][2]))
												colIndex = 2;
											else {
												// ... в любую клетку
												noneCell = __findNone(game.field);
												rowIndex = noneCell.rowIndex;
												colIndex = noneCell.colIndex;
											}
										} else {
											colIndex = (colIndex + 2) % 4;
											if (__checkNone(game.field[0][colIndex]))
												rowIndex = 0;
											else if (__checkNone(game.field[2][colIndex]))
												rowIndex = 2;
											else {
												// ... в любую клетку
												noneCell = __findNone(game.field);
												rowIndex = noneCell.rowIndex;
												colIndex = noneCell.colIndex;
											}
										}
									}
								} else {
									// Игрок ходил первым
									if (game.moveCounter === 1) {
										if ((game.lastPlayerMove.rowIndex === 1) && 
											(game.lastPlayerMove.colIndex === 1)) {
											
											// Если крестики сделали первый ход в центр, 
											// до конца игры ходить в любой угол, а если это 
											// невозможно — в любую клетку.
											state = 0;
										} else {
											// Если крестики сделали первый ход в угол, ответить ходом в центр
											// Если крестики сделали первый ход на сторону, ответить ходом в цент
											rowIndex = 1;
											colIndex = 1;
											
											if ((game.lastPlayerMove.rowIndex % 2 === 0) && 
												(game.lastPlayerMove.colIndex % 2 === 0)) {
												// Если крестики сделали первый ход в угол, ответить ходом в центр
												// Следующим ходом занять угол, противоположный первому ходу крестиков, а 
												// если это невозможно — пойти на сторону.
												state = 1;
												
												// Запомнить первый ход игрока
												firstRowIndex = game.lastPlayerMove.rowIndex;
												firstColIndex = game.lastPlayerMove.colIndex;
											} else {
												// Если крестики сделали первый ход на сторону, ответить ходом в цент
												//  - Если следующий ход крестиков — в угол, занять противоположный угол
												//  - Если следующий ход крестиков — на противоположную сторону, пойти в любой угол
												//  - Если следующий ход крестиков — на сторону рядом с их первым ходом, 
												// пойти в угол рядом с обоими крестиками
												// ... не успеваю ...
												state = 2;
											}
										}
									} else {
										if (state === 0) {
											// ... до конца игры ходить в любой угол, а если это 
											// невозможно — в любую клетку.
											if (__checkNone(game.field[0][0])) {
												rowIndex = 0;
												colIndex = 0;
											} else if (__checkNone(game.field[2][2])) {
												rowIndex = 2;
												colIndex = 2;
											} else if (__checkNone(game.field[0][2])) {
												rowIndex = 0;
												colIndex = 2;
											} else if (__checkNone(game.field[2][0])) {
												rowIndex = 2;
												colIndex = 0;
											} else {
												noneCell = __findNone(game.field);
												rowIndex = noneCell.rowIndex;
												colIndex = noneCell.colIndex;
											}
										} else if (state === 1) {
											// Следующим ходом занять угол, противоположный первому ходу крестиков, а 
											// если это невозможно — пойти на сторону.
											rowIndex = (firstRowIndex + 2) % 4;
											colIndex = (firstColIndex + 2) % 4;
											if (!__checkNone([rowIndex][colIndex])) {
												if (__checkNone(game.field[0][1])) {
													rowIndex = 0;
													colIndex = 1;
												} else if (__checkNone(game.field[1][0])) {
													rowIndex = 1;
													colIndex = 0;
												} else if (__checkNone(game.field[2][1])) {
													rowIndex = 2;
													colIndex = 1;
												} else if (__checkNone(game.field[1][2])) {
													rowIndex = 1;
													colIndex = 2;
												}
											}
											state = -1;
										}
									}
								}
							}
						}
					}
					
					if (rowIndex === undefined) {
						// Использовать слабую стратегию (безысходность)
						__weakStrategy(game);
					} else {
						// Сделать ход
						game.field[rowIndex][colIndex] = game.computerSide;
						// Инициировать событие в контроллере
						controller.onComputerMove(rowIndex, colIndex);
					}
				};
			}
			
			// Стратегия игры слабого компьютера
			function __weakStrategy(game) {
				// Поиск любой ячейки
				var noneCell = __findNone(game.field);
				// Сделать ход
				game.field[noneCell.rowIndex][noneCell.colIndex] = game.computerSide;
				// Инициировать событие в контроллере
				controller.onComputerMove(noneCell.rowIndex, noneCell.colIndex);
			}
			
			// Инициализация
			return create();
		}
		
		// Данные игры
		function Game(whoseTurn, computer) {
			// Конструктор
			function create() {
				// Создаваемый объект
				var object = {};
				
				// Признак завершения игры
				object.completed = false;
				// Хранить номер хода
				object.moveCounter = 0;
				// Установить начальное значение очереди ходов
				object.whoseTurn = whoseTurn;
				
				// Инициализация игрового поля
				object.field = [];
				for (var i = 0; i < 3; i++)
					object.field[i] = [GameFieldValue.None, GameFieldValue.None, 
					                   GameFieldValue.None];
				
				// Определить стороны противостояния
				if (object.whoseTurn === WhoseTurn.Computer) {
					// Копьютер будет стаить крестики, а игрок нолики
					object.computerSide = GameFieldValue.Tic;
					object.playerSide = GameFieldValue.Toe;
					
				} else {
					// Копьютер будет стаить нолики, а игрок крестики
					object.computerSide = GameFieldValue.Toe;
					object.playerSide = GameFieldValue.Tic;
				}
				
				// Функция обработки следующего хода
				object.move = move;
				
				// Вернуть ссылку на описание игры
				return object;
			}
			
			// Обработка следующего хода
			function move(rowIndex, colIndex) {
				// Игра закончена
				if (this.completed)
					return false;
				
				// Выполнить ход
				if (this.whoseTurn === WhoseTurn.Player) {
					if (this.field[rowIndex][colIndex] === GameFieldValue.None) {
						// Установить символ пользователя в нужные координаты
						this.field[rowIndex][colIndex] = this.playerSide;
						// Сохранить координаты последнего хода игрока
						this.lastPlayerMove = {
							rowIndex: rowIndex,
							colIndex: colIndex
						};
					} else {
						// Ход невозможен, т.к. клетка занята
						return false;
					}
				} else {
					// Компьютер сам решает куда ему ставить
					computer.move(this);
				}
				
				// Проверить завершение игры
				var completion = __completion.call(this);
				if (completion.completed) {
					// Игра завершена вничью
					if (completion.strike.length === 0)
						this.whoseTurn = WhoseTurn.None;
					// Инициировать завершение игры
					controller.onEndGame(completion.strike);
					// Игра закончена
					this.completed = true;
				} else {
					// Передать очередность хода
					this.whoseTurn = (this.whoseTurn + 1) % 2;
					// Увеличить счетчик ходов
					this.moveCounter++;
				}
				
				return true;
			}
			
			// Состояение игры
			function __completion() {
				// Результат
				var result = {
					completed: true,
					strike: []
				};
				
				// По горизонтали
				for (var r = 0; r < 3; r++) {
					if ((this.field[r][0] === this.field[r][1])
						&& (this.field[r][1] === this.field[r][2])
						&& (this.field[r][2] !== GameFieldValue.None)) {
						
						result.strike = [{rowIndex: r, colIndex: 0},
						                 {rowIndex: r, colIndex: 1},
						                 {rowIndex: r, colIndex: 2}];
						return result;
					}
				}
				
				// По вертикали
				for (var c = 0; c < 3; c++) {
					if ((this.field[0][c] === this.field[1][c])
						&& (this.field[1][c] === this.field[2][c])
						&& (this.field[2][c] !== GameFieldValue.None)) {
						
						result.strike = [{rowIndex: 0, colIndex: c},
						                 {rowIndex: 1, colIndex: c},
						                 {rowIndex: 2, colIndex: c}];
						return result;
					}
				}
				
				// По диагонали
				if ((this.field[0][0] === this.field[1][1])
					&& (this.field[1][1] === this.field[2][2])
					&& (this.field[2][2] !== GameFieldValue.None)) {
					
					result.strike = [{rowIndex: 0, colIndex: 0},
					                 {rowIndex: 1, colIndex: 1},
					                 {rowIndex: 2, colIndex: 2}];
					return result;
				}

				if ((this.field[0][2] === this.field[1][1])
					&& (this.field[1][1] === this.field[2][0])
					&& (this.field[2][0] !== GameFieldValue.None)) {
					
					result.strike = [{rowIndex: 0, colIndex: 2},
					                 {rowIndex: 1, colIndex: 1},
					                 {rowIndex: 2, colIndex: 0}];
					return result;
				}
				
				for (var r = 0; r < 3; r++) {
					for (var c = 0; c < 3; c++) {
						if (this.field[r][c] === GameFieldValue.None) {
							result.completed = false;
							return result;
						}
					}
				}
				return result;
			}
			
			// Инициализация
			return create();
		}
		
		// Начать новую игру
		function newGame() {
			// Добавить очков победителю
			if (this.game) {
				if (this.game.whoseTurn === WhoseTurn.Computer)
					this.computerPoints++;
				else if (this.game.whoseTurn === WhoseTurn.Player)
					this.playerPoints++;
			}
			
			if (__gamesCount++ < GAMES_LIMIT) {
				// Создать игру
				this.game = Game(__whoseTurn, __computer);
				// Передать очередь на следующую игру
				__whoseTurn = (__whoseTurn + 1) % 2;
				return true;
			} else {
				// Инициировать завершения серии игр
				controller.onEndGameSet();
				return false;
			}
		}
		
		// Инициализация
		return create();
	}
	
	
	
	// Раздел данных с историей игр
	function HistoryModel() {
		// Название cookies
		var STORAGE_NAME = 'history';
		// Максимальное количество игр
		var MAX_COUNT = 10;

		// Конструктор
		function create() {
			// Создаваемый объект
			var object = {
				games : [],
				add   : add,
				clear : clear,
				best  : best
			};
			
			// Загрузить историю
			__load.call(object);
			
			return object;
		}
		
		// Добавить запись с результатами игры
		function add(gameSet) {
			// Дата сохранения результата игры
			var date = (new Date());
			date = __pad(date.getDay(), 2) + '.' + __pad(date.getMonth(), 2) + '.' + date.getFullYear() + ' ' +
				__pad(date.getHours(), 2) + ':' + __pad(date.getMinutes(), 2) + ':' + __pad(date.getSeconds(), 2);
			
			// Добавляемая запись
			var result = {
				player: gameSet.playerName,
				date:  date,
				playerPoints: gameSet.playerPoints,
				computerPoints: gameSet.computerPoints,
			};
			
			// Удалить старый (не лучший) результат (при переполнении)
			if (this.games.length === MAX_COUNT) {
				var toRemove = 0;
				if (this.games[toRemove] === this.best())
					toRemove++;
				this.games.splice(toRemove, 1);
			}
			
			// Добавить новый результат
			this.games.push(result);
			
			// Сохранить изменения
			__save.call(this);
		}
		
		// Очистка истории игр
		function clear() {
			// Очистить историю
			this.games = [];
			// Сохранить изменения
			__save.call(this);
		}
		
		// Лучшая игра
		function best() {
			var maxPoints = 0;
			var bestResult = null;
			for (var i = 0; i < this.games.length; i++)
				if (this.games[i].playerPoints > maxPoints) {
					bestResult = this.games[i];
					maxPoints = this.games[i].playerPoints;
				}
			return bestResult;
		}
		
		// Незначащие нули
		function __pad(number, size) {
		    var s = "000000000" + number;
		    return s.substr(s.length - size);
		}
		
		
		// Загрузить данные из cookies
		function __load() {
			this.games = $.parseJSON($.cookie(STORAGE_NAME)) || [];
		}
		
		// Сохранить данные в cookies
		function __save() {
			$.cookie(STORAGE_NAME, $.toJSON(this.games));
		}
		
		// Инициализация
		return create();
	}
}



//========================================================================
// Построитель HTML-строк
HTMLBuilder = function()
{
	this._buffer = new Array();
	this._index = 0;
};

HTMLBuilder.prototype.append =  function(text) 
{
	this._buffer[this._index] = text;
	this._index++;
	return this;
};

HTMLBuilder.prototype.toString = function() 
{
	return this._buffer.join('');
};



//====================================================================
// Функция для работы с cookie
$.cookie = function(name, value, options) 
{
	if (typeof value != 'undefined') { 
 		// name and value given, set cookie
		options = options || {};
		if (value === null) {
			value = '';
			options.expires = -1;
		}
		
		var expires = '';
		if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
			var date;
			if (typeof options.expires == 'number') {
				date = new Date();
				date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
			} else {
				date = options.expires;
			}
			expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
		}

		// CAUTION: Needed to parenthesize options.path and options.domain
		// in the following expressions, otherwise they evaluate to undefined
		// in the packed version for some reason...
		var path = options.path ? '; path=' + (options.path) : '';
		var domain = options.domain ? '; domain=' + (options.domain) : '';
		var secure = options.secure ? '; secure' : '';
		document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
	} else { 
		// only name given, get cookie
		var cookieValue = null;
		if (document.cookie && document.cookie != '') {
			var cookies = document.cookie.split(';');
			for (var i = 0; i < cookies.length; i++) {
				var cookie = jQuery.trim(cookies[i]);
				// Does this cookie string begin with the name we want?
				if (cookie.substring(0, name.length + 1) == (name + '=')) {
					cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
					break;
				}
			}
		}
		return cookieValue;
	}
};