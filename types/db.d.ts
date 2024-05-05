// El archivo db.d.ts es un archivo de definición de tipos que se utiliza para definir los tipos de datos que se utilizan en la base de datos de Redis. En este caso, se define el tipo de datos de los mensajes y de los usuarios.

interface User {
    name: string;
    email: string;
    image: string;
    id: string;
}