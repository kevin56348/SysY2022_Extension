grammar SysY

entry Model:
    (decls+=Decl)* (funcdefs+=FuncDef)* mainfuncdef=MainFuncDef;

// Person:
//     'person' name=ID;

// Greeting:
//     'Hello' person=[Person:ID] '!';

Decl:
    ConstDecl | VarDecl;

FuncDef:
    ('void' | 'int') func=ID '(' (FuncFParams)? ')' Block;

MainFuncDef:
    'int' 'main' '(' ')' Block;

Ident:
    name=ID;

fragment ConstDecl:
    'const' 'int' ConstDef (',' ConstDef)* ';';

fragment ConstDef:
    idents+=Ident ('[' ConstExp ']')* '=' ConstInitVal;

fragment ConstInitVal:
    ConstExp | ('{' ( ConstInitVal ( ',' ConstInitVal )* )? '}') ;

fragment VarDecl:
    'int' VarDef ( ',' VarDef )* ';';

fragment VarDef:
    (idents+=Ident ('[' ConstExp ']')*) | (idents+=Ident ('[' ConstExp ']')* '=' InitVal);

fragment InitVal:
    Exp | ('{'  (InitVal  (',' InitVal)* )?  '}');

fragment FuncFParams:
    FuncFParam (',' FuncFParam)*;

fragment FuncFParam:
    'int' idents+=Ident ('[' ']'  ('[' ConstExp ']')* )?;

fragment Block:
    '{' ( BlockItem )* '}';

fragment BlockItem:
    decls+=Decl | Stmt;

fragment Stmt:
    LVal '=' Exp ';' | (Exp)? ';' | Block | 
    'if' '(' Cond ')' Stmt ( 'else' Stmt )?  | 
    'while' '(' Cond ')' Stmt |
    'break' ';' | 'continue' ';' | 
    'return' (Exp)? ';' | 
    LVal '=' 'getint''('')'';' | 
    'printf''('(('"%d"' | '"%d\\n"' | STRING)?)(','Exp)*')'';' ;

fragment Exp:
    AddExp;

fragment Cond:
    LOrExp;

fragment LVal:
    idents+=Ident ('[' Exp ']')*;

fragment PrimaryExp:
    numint=INT | '(' Exp ')' | LVal;

fragment UnaryExp:
    (PrimaryExp) | (idents+=Ident '(' (FuncRParams)? ')') | (('+' | '-' | '!') UnaryExp);

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
terminal INT returns number: /[+-]?[0-9]+/;
terminal ID: /[_a-zA-Z0-9]+[\w_]*/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
