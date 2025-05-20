import { promises as fsPromises } from 'fs';
export default async function saveFile(file: Express.Multer.File) {
  const randomFileName = Math.random().toString(36).substring(7);
  const extension = file.originalname.split('.').pop();
  const filePath = `dist/${process.env.UPLOADS_DIR}/${Date.now()}${randomFileName}.${extension}`;
  try {
    //dir is exist
    await fsPromises.access(`dist/${process.env.UPLOADS_DIR}`);
  } catch (e) {
    //dir is not exist
    await fsPromises.mkdir(`dist/${process.env.UPLOADS_DIR}`);
  }
  await fsPromises.writeFile(filePath, file.buffer);
  //return path to file without dist
  return filePath.slice(5);
}
