import 'normalize.css';
import './styles/style.css';

import GameModel from './models/GameModel';
import GameView from './views/GameView';
import GameController from './controllers/GameController';

/**
 * Application entry point
 * 
 * Initializes the game by creating Model, View, and Controller instances
 * and starting the game when the DOM is ready.
 */
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