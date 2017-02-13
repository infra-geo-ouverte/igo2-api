import { IPlugin, IPluginOptions } from "../interfaces";
import * as Hapi from "hapi";
// import { IUser, UserModel } from "../../users/user";

export default (): IPlugin => {
    return {
        register: (server: Hapi.Server, options: IPluginOptions): Promise<void> => {
          return new Promise<void>(resolve => {
            const database = options.database;
              const serverConfig = options.serverConfigs;

              const validateUser = (decoded, request, cb) => {
                  /*database.userModel.findById(decoded.id).lean(true)
                      .then((user: IUser) => {
                          if (!user) {
                              return cb(null, false);
                          }

                          return cb(null, true);
                      });*/
                      return cb(null, true);
              };

            server.register(require('hapi-auth-jwt2'), (error) => {
                if (error) {
                    console.log('error', error);
                } else {
                    server.auth.strategy('jwt', 'jwt', true, {
                        key: serverConfig.jwtSecret,
                        validateFunc: validateUser,
                        verifyOptions: { algorithms: ['HS256'] }
                    });
                }

                resolve();
              });
          });
        },
        info: () => {
            return {
                name: "JWT Authentication",
                version: "1.0.0"
            };
        }
    };
};
