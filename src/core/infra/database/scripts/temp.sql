DELETE FROM auth.account where id = 'e34fd5ab-fb3b-428e-935b-7db5bd08a3e5';

INSERT INTO auth.account_status (`allowLogin`, `clientStatus`, `description`)
VALUES (TRUE, 'OK', 'Default Status');

INSERT INTO auth.account (`deleteCode`, `email`, `lastLogin`, `password`, 
`accountStatusId`, `username`)
VALUES ('1234567', 'admin@test.com', NULL, 
'$2y$10$5e9nP50E64iy8vaSMwrRWO7vCfnA7.p5XpIDHC3hPdi6BCtTF7rBS', 1, 'admin');