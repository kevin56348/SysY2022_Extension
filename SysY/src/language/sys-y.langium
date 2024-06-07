grammar SysY

entry Model:
    (decls+=Decl)* (funcdefs+=FuncDef)* mainfuncdef=MainFuncDef;

Decl:
    decls_spc=(ConstDecl | VarDecl);

FuncDef:
    ('void' | 'int') func=ID '(' (funcfps=FuncFParams)? ')' blks=Block;

MainFuncDef:
    'int' 'main' '(' ')' blks=Block;

Ident:
    name=ID;

ConstDecl:
    'const' 'int' const_def+=ConstDef (',' const_def+=ConstDef)* ';';

ConstDef:
    idents=Ident ('[' const_exp+=ConstExp ']')* '=' const_init_val=ConstInitVal;

ConstInitVal:
    const_exp=ConstExp | ('{' ( const_init_val+=ConstInitVal ( ',' const_init_val+=ConstInitVal )* )? '}');

VarDecl:
    'int' var_def+=VarDef ( ',' var_def+=VarDef )* ';';

VarDef:
    (idents=Ident ('[' const_exp+=ConstExp ']')*) | (idents=Ident ('[' const_exp+=ConstExp ']')* '=' init_val+=InitVal);

InitVal:
    exps+=Exp | ('{'  (init_vals+=InitVal  (',' init_vals+=InitVal)* )?  '}');

FuncFParams:
    funcfp+=FuncFParam (',' funcfp+=FuncFParam)*;

FuncFParam:
    'int' ident=Ident ('[' ']'  ('[' const_exp+=ConstExp ']')* )?;

Block:
    '{' ( bis+=BlockItem )* '}';

BlockItem:
    decls+=Decl | stmts+=Stmt;

Stmt:
    lv=LVal '=' exps+=Exp ';' |
    (exps+=Exp)? ';' | 
    blks+=Block | 
    'if' '(' conds+=Cond ')' stmts+=Stmt ( 'else' stmts+=Stmt )?  | 
    'while' '(' conds+=Cond ')' stmts+=Stmt |
    'break' ';' | 
    'continue' ';' | 
    'return' (exps+=Exp)? ';' | 
    lv+=LVal '=' 'getint''('')'';' | 
    'printf''('str=STRING (',' exps+=Exp)*')'';';

Exp:
    exps+=AddExp;

Cond infers Exp:
    exps+=LOrExp;

LVal:
    idents+=Ident ('[' exps+=Exp ']')*;

PrimaryExp infers Exp:
    numint=INT | '(' exps+=Exp ')' | lv+=LVal;

UnaryExp infers Exp:
    exps+=PrimaryExp | (idents+=Ident '(' (funrps+=FuncRParams)? ')') | (('+' | '-' | '!') exps+=UnaryExp);

FuncRParams:
    exps+=Exp ( ',' exps+=Exp )*;

MulExp infers Exp:
    exps+=UnaryExp exps+=_MulExp;

_MulExp infers Exp:
    (('*' | '/' | '%') exps+=UnaryExp)*;

AddExp infers Exp:
    exps+=MulExp exps+=_AddExp;

_AddExp infers Exp:
    (('+' | '-')  exps+=MulExp)*;

RelExp infers Exp:
    exps+=AddExp exps+=_RelExp;

_RelExp infers Exp:
    (('<' | '>' | '<=' | '>=') exps+=AddExp)*;

EqExp infers Exp:
    exps+=RelExp exps+=_EqExp;

_EqExp infers Exp:
    (('==' | '!=') exps+=RelExp)*;

LAndExp infers Exp:
    exps+=EqExp exps+=_LAndExp;

_LAndExp infers Exp:
    ('&&' exps+=EqExp)*;

LOrExp infers Exp:
    exps+=LAndExp exps+=_LOrExp;

_LOrExp infers Exp:
    ('||' exps+=LAndExp)*;

ConstExp infers Exp:
    exps+=AddExp;

hidden terminal WS returns string: /\s+/;
terminal ID returns string: /[_a-zA-Z][_a-zA-Z0-9]*[\w_]*/;
terminal INT returns number: /[+-]?[1-9][0-9]*|[+-]?[0-9]/;
terminal STRING returns string: /"(\\.|[^"\\])*"/;

hidden terminal ML_COMMENT returns string: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT returns string: /\/\/[^\n\r]*/;
