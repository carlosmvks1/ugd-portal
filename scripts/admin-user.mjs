import {openAdminStore} from './admin-server.mjs';
import {AdminError} from './admin-store.mjs';
// La contraseña entra por stdin: no se incluye en argumentos ni en el historial.
const [username,role]=process.argv.slice(2);
if(!username||!role){console.error('Uso: npm run admin:user -- usuario editor|reviewer|publisher < archivo-contraseña');process.exit(1);}
let password='';for await(const chunk of process.stdin){password+=chunk;if(password.length>258)throw new AdminError(422,'Contraseña demasiado larga.');}
password=password.replace(/\r?\n$/,'');
const store=await openAdminStore();
try{if(role==='reset'){store.resetPassword(username,password);console.log('Contraseña restablecida y sesiones revocadas: '+username);}else{const user=store.createUser(username,role,password);console.log('Usuario creado: '+user.username+' ('+user.role+')');}}
catch(e){console.error(e instanceof AdminError?e.message:'No se pudo crear el usuario.');process.exitCode=1;}
finally{store.close();}
