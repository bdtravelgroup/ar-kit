function classExtendsController(path) {
  if (!path.node.superClass || !path.node.superClass.name) {
    return false;
  }
  return path.node.superClass.name.indexOf('Controller') !== -1;
}

function setDisplayNameAfter(path, nameNodeId, t, displayName) {
  if (!displayName) {
    displayName = nameNodeId.name;
  }

  let blockLevelStmnt;

  path.find(p => {
    if (p.parentPath.isBlock()) {
      blockLevelStmnt = p;
      return true;
    }
    return false;
  });

  if (blockLevelStmnt) {
    delete blockLevelStmnt.node.trailingComments;

    const setDisplayNameStmn = t.expressionStatement(
      t.assignmentExpression(
        '=',
        t.memberExpression(nameNodeId, t.identifier('displayName')),
        t.stringLiteral(displayName)
      )
    );

    blockLevelStmnt.insertAfter(setDisplayNameStmn);
  }
}

function transform(babel) {
  return {
    visitor: {
      ClassDeclaration(path, state) {
        if (classExtendsController(path)) {
          setDisplayNameAfter(path, path.node.id, babel.types);
        }
      }
    }
  };
}

module.exports = transform;
