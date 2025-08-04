import { Router } from 'express';
import { createParagraph, getParagraphs } from '../controllers/paragraphController';
import { controllerWrapper } from '../utils/controllerWrapper';

const paragraphRouter = Router();

paragraphRouter.get('/', controllerWrapper(getParagraphs));
paragraphRouter.post('/', controllerWrapper(createParagraph));

export default paragraphRouter;
