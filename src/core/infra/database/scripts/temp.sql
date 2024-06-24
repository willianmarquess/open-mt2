DELETE FROM auth.account;

INSERT INTO auth.account_status (`allowLogin`, `clientStatus`, `description`)
VALUES (TRUE, 'OK', 'Default Status');

INSERT INTO auth.account (`deleteCode`, `email`, `lastLogin`, `password`, 
`accountStatusId`, `username`)
VALUES ('1234567', 'admin@test.com', NULL, 
'$2b$05$KXeREc2TNuUR6IcgzUiX4.WA/0i3Yd3WpUHMtAcQi1ojWRdeQ9ExS', 1, 'admin');

INSERT INTO auth.account (`deleteCode`, `email`, `lastLogin`, `password`, 
`accountStatusId`, `username`)
VALUES ('1234567', 'admin1@test.com', NULL, 
'$2b$05$KXeREc2TNuUR6IcgzUiX4.WA/0i3Yd3WpUHMtAcQi1ojWRdeQ9ExS', 1, 'admin1');