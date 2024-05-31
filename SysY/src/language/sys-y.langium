grammar SysY

entry Model:
    (decls+=Decl)* (funcdefs+=FuncDef)* mainfuncdef=MainFuncDef;

Decl:
    decls_spc=(ConstDecl | VarDecl);

FuncDef:
    ('void' | 'int') func=ID '(' (FuncFParams)? ')' blks=Block;

MainFuncDef:
    'int' 'main' '(' ')' blks=Block;

Ident:
    name=ID;

ConstDecl:
    'const' 'int' const_def+=ConstDef (',' const_def+=ConstDef)* ';';

ConstDef:
    idents=Ident ('[' const_exp+=ConstExp ']')* '=' const_init_val+=ConstInitVal;

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
    'int' idents+=Ident ('[' ']'  ('[' const_exp+=ConstExp ']')* )?;

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
    idents=Ident ('[' exps+=Exp ']')*;

PrimaryExp infers Exp:
    numint=INT | '(' exps+=Exp ')' | lv+=LVal;

UnaryExp infers Exp:
    pexp+=PrimaryExp | (idents+=Ident '(' (funrps+=FuncRParams)? ')') | (('+' | '-' | '!') uexp+=UnaryExp);

FuncRParams:
    exps+=Exp ( ',' exps+=Exp )*;

MulExp infers Exp:
    uexp+=UnaryExp mexp+=_MulExp;

_MulExp infers Exp:
    (('*' | '/' | '%') uexp+=UnaryExp)*;

AddExp infers Exp:
    mexp+=MulExp aexp+=_AddExp;

_AddExp infers Exp:
    (('+' | '-')  mexp+=MulExp)*;

RelExp infers Exp:
    aexp+=AddExp rexp+=_RelExp;

_RelExp infers Exp:
    (('<' | '>' | '<=' | '>=') aexp+=AddExp)*;

EqExp infers Exp:
    rexp+=RelExp eexp+=_EqExp;

_EqExp infers Exp:
    (('==' | '!=') rexp+=RelExp)*;

LAndExp infers Exp:
    eexp+=EqExp laexp+=_LAndExp;

_LAndExp infers Exp:
    ('&&' eexp+=EqExp)*;

LOrExp infers Exp:
    laexp+=LAndExp loexp+=_LOrExp;

_LOrExp infers Exp:
    ('||' laexp+=LAndExp)*;

ConstExp infers Exp:
    aexp+=AddExp;

hidden terminal WS returns string: /\s+/;
terminal ID returns string: /[_a-zA-Z][_a-zA-Z0-9]*[\w_]*/;
terminal INT returns number: /[+-]?[1-9][0-9]*|[+-]?[0-9]/;
terminal STRING returns string: /"(\\.|[^"\\])*"/;

hidden terminal ML_COMMENT returns string: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT returns string: /\/\/[^\n\r]*/;
