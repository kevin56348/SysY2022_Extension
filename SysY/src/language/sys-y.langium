grammar SysY

entry Model:
    (decls+=Decl)* (funcdefs+=FuncDef)* MainFuncDef;

// Person:
//     'person' name=ID;

// Greeting:
//     'Hello' person=[Person:ID] '!';

Decl:
    ConstDecl | VarDecl;

FuncDef:
    ('void' | 'int') ident=ID '(' (FuncFParams)? ')' Block;

MainFuncDef:
    'int' 'main' '(' ')' Block;

fragment ConstDecl:
    'const' 'int' ConstDef (',' ConstDef)* ';';

fragment ConstDef:
    ident=ID ('[' ConstExp ']')* '=' ConstInitVal;

fragment ConstInitVal:
    ConstExp | ('{' ( ConstInitVal ( ',' ConstInitVal )* )? '}') ;

fragment VarDecl:
    'int' VarDef ( ',' VarDef )* ';';

fragment VarDef:
    (ident=ID ('[' ConstExp ']')*) | (ident=ID ('[' ConstExp ']')* '=' InitVal);

fragment InitVal:
    Exp | ('{'  (InitVal  (',' InitVal)* )?  '}');

fragment FuncFParams:
    FuncFParam (',' FuncFParam)*;

fragment FuncFParam:
    'int' ident=ID ('[' ']'  ('[' ConstExp ']')* )?;

fragment Block:
    '{' ( BlockItem )* '}';

fragment BlockItem:
    Decl | Stmt;

fragment Stmt:
    LVal '=' Exp ';' | (Exp)? ';' | Block | 
    'if' '(' Cond ')' Stmt ( 'else' Stmt )?  | 
    'break' ';' | 'continue' ';' | 
    'return' (Exp)? ';' | 
    LVal '=' 'getint''('')'';' | 
    'printf''('(('"%d"' | '"%d\\n"' | STRING)?)(','Exp)*')'';' ;

fragment Exp:
    AddExp;

fragment Cond:
    LOrExp;

fragment LVal:
    ident=ID ('[' Exp ']')*;

fragment PrimaryExp:
    '(' Exp ')' | LVal | number=INT;

fragment UnaryExp:
    (PrimaryExp | ident=ID '(' (FuncRParams)? ')') | (('+' | '-' | '!') UnaryExp);

fragment FuncRParams:
    Exp ( ',' Exp )*;

fragment MulExp:
    UnaryExp _MulExp;

fragment _MulExp:
    (('*' | '/' | '%') UnaryExp)*;

fragment AddExp:
    MulExp _AddExp;

fragment _AddExp:
    (('+' | '-') MulExp)*;

fragment RelExp:
    AddExp _RelExp;

fragment _RelExp:
    (('<' | '>' | '<=' | '>=') AddExp)*;

fragment EqExp:
    RelExp _EqExp;

fragment _EqExp:
    (('==' | '!=') RelExp)*;

fragment LAndExp:
    EqExp _LAndExp;

fragment _LAndExp:
    ('&&' EqExp)*;

fragment LOrExp:
    LAndExp _LOrExp;

fragment _LOrExp:
    ('||' LAndExp)*;

fragment ConstExp:
    AddExp;

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][_a-zA-Z0-9]?[\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
