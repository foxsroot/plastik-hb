import { Router } from 'express';
import { createHeading, getHeadings } from '../controllers/headingController';
import { controllerWrapper } from '../utils/controllerWrapper';

const headingRouter = Router();

headingRouter.get('/', controllerWrapper(getHeadings));
headingRouter.post('/', controllerWrapper(createHeading));

export default headingRouter;
