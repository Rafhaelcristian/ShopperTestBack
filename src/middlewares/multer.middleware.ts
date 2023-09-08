import { NextFunction, Request, RequestHandler, Response } from "express";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const multerMiddleware: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: "Erro ao fazer upload do arquivo" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo foi enviado" });
    }
    return next();
  });
};
