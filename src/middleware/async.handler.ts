import { Request, Response, NextFunction } from 'express';

// AsyncHandler to handle asynchronous middleware and route handlers
export const AsyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};


// import { Request, Response, NextFunction } from 'express';

// // Corrected type name to AsyncControllerType 🛠️
// type AsyncControllerType = (req: Request, res: Response, next: NextFunction) => Promise<void>;

// // Async handler to catch errors in async controllers and pass them to next middleware (error handling) 🚨
// export const AsyncHandler = (controller: AsyncControllerType): AsyncControllerType => async (req, res, next) => {
//     try {
//       await controller(req, res, next); // Await the controller function and handle promise rejection ⏳
//     } catch (error) {
//       next(error); // Pass any caught error to the next middleware 💥
//     }
//   };
