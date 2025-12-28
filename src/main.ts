import 'normalize.css';
import './styles/style.css';

import GameModel from './models/GameModel';
import GameView from './views/GameView';
import GameController from './controllers/GameController';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const model = new GameModel();

        const view = new GameView();

        const controller = new GameController(model, view);

        await controller.init();
    } catch (error) {
        console.error('Failed to initialize game:', error);
    }
});