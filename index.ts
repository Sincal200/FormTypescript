import express, { Express, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import cors from 'cors';

const port = 4000;
const app = express();
app.use(cors());
app.use(express.json());

const uploadsDir = path.join(__dirname, 'uploads');

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, uploadsDir);
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});

const uploads = multer({ storage: storage });

app.post("/upload", uploads.array("files"), (req: Request, res: Response) => {
    console.log(req.body);
    console.log(req.files);

    if (!req.files) {
        res.status(400).json({ status: "error", message: "No files uploaded" });
        return;
    }

    const filesInfo = (req.files as Express.Multer.File[]).map(file => ({
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path
    }));

    // Crear un objeto con la información del usuario y los archivos subidos
    const newUserInfo = {
        name: req.body.name,
        email: req.body.email,
        files: filesInfo
    };

    const jsonFilePath = path.join(uploadsDir, 'userInfo.json');

    // Lectura de archivo JSON
    const readJsonFile = (filePath: string, callback: (err: Error | null, data?: any) => void) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                callback(err);
                return;
            }
            try {
                const jsonData = JSON.parse(data);
                callback(null, jsonData);
            } catch (parseErr) {
                if (parseErr instanceof Error) {
                    callback(parseErr);
                } else {
                    callback(new Error('Unknown error occurred during JSON parsing'));
                }
            }
        });
    };

    // Leer archivo JSON y agregar nuevo contenido
    readJsonFile(jsonFilePath, (err, userInfoArray) => {
        let userInfo = [];
        if (err) {
            if ((err as any).code === 'ENOENT') {
                // Crear si no existe
                userInfo = [newUserInfo];
            } else {
                console.error("Error reading JSON file", err);
                res.status(500).json({ status: "error", message: "Error reading JSON file" });
                return;
            }
        } else {
            try {
                userInfo = userInfoArray;
                userInfo.push(newUserInfo);
            } catch (parseErr) {
                console.error("Error parsing JSON file", parseErr);
                res.status(500).json({ status: "error", message: "Error parsing JSON file" });
                return;
            }
        }

        // Agregar nuevo contenido
        fs.writeFile(jsonFilePath, JSON.stringify(userInfo, null, 2), (writeErr) => {
            if (writeErr) {
                console.error("Error writing to JSON file", writeErr);
                res.status(500).json({ status: "error", message: "Error writing to JSON file" });
                return;
            }
            res.status(200).json({ status: "success", message: "File uploaded successfully" });
        });
    });
});

app.get('/', (req, res) => {
    res.send('Hello World TSSSS');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
