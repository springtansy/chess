const board = document.getElementById("board");

const pieces = {
    wK: "pieces/whiteking.svg",
    wQ: "pieces/whitequeen.svg",
    wR: "pieces/whiterook.svg",
    wB: "pieces/whitebishop.svg",
    wN: "pieces/whiteknight.svg",
    wP: "pieces/whitepawn.svg",

    bK: "pieces/blackking.svg",
    bQ: "pieces/blackqueen.svg",
    bR: "pieces/blackrook.svg",
    bB: "pieces/blackbishop.svg",
    bN: "pieces/blackknight.svg",
    bP: "pieces/blackpawn.svg"
};

const startingPosition = [
    ["bR", "bN", "bB", "bQ", "bK", "bB", "bN", "bR"],
    ["bP", "bP", "bP", "bP", "bP", "bP", "bP", "bP"],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ["wP", "wP", "wP", "wP", "wP", "wP", "wP", "wP"],
    ["wR", "wN", "wB", "wQ", "wK", "wB", "wN", "wR"]
];

let currentPosition = startingPosition;

let castlingRights = {
    wK: true,
    wQ: true,
    bK: true,
    bQ: true
};

for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {

        const square = document.createElement("div");

        square.classList.add("square");

        if ((row + col) % 2 === 0) {
            square.classList.add("light");
        } else {
            square.classList.add("dark");
        }

        const piece = currentPosition[row][col];

        if (piece) {
            const image = document.createElement("img");

            image.src = pieces[piece];
            image.alt = piece;

            square.appendChild(image);
        }

        board.appendChild(square);
    }
}

let selectedSquare = null;
let currentTurn = "w";

const squares = document.querySelectorAll(".square");

function promotePawn(row, col) {
    const pawn = currentPosition[row][col];

    if (pawn !== "wP" && pawn !== "bP") {
        return;
    }

    // Queen promotion only, fix later
    const promotedPiece = pawn[0] === "w" ? "wQ" : "bQ";

    currentPosition[row][col] = promotedPiece;
}

function updateCastlingRights(
    fromRow, fromCol,
    toRow, toCol
) {
    if (
        (fromRow === 7 && fromCol === 0) ||
        (toRow === 7 && toCol === 0)
    ) {
        castlingRights.wQ = false;
    }

    if (
        (fromRow === 0 && fromCol === 0) ||
        (toRow === 0 && toCol === 0)
    ) {
        castlingRights.bQ = false;
    }

    if (
        (fromRow === 7 && fromCol === 7) ||
        (toRow === 7 && toCol === 7)
    ) {
        castlingRights.wK = false;
    }

    if (
        (fromRow === 0 && fromCol === 7) ||
        (toRow === 0 && toCol === 7)
    ) {
        castlingRights.bK = false;
    }

    if (
        (fromRow === 0 && fromCol === 4) ||
        (toRow === 0 && toCol === 4)
    ) {
        castlingRights.bK = false;
        castlingRights.bQ = false;
    }

    if (
        (fromRow === 7 && fromCol === 4) ||
        (toRow === 7 && toCol === 4)
    ) {
        castlingRights.wK = false;
        castlingRights.wQ = false;
    }
}

function getSlidingAttacks(row, col, directions) {
    const moves = [];
    const piece = currentPosition[row][col];

    if (!piece) {
        return moves;
    }

    for (const [rowDirection, colDirection] of directions) {
        let newRow = row + rowDirection;
        let newCol = col + colDirection;

        while (
            newRow >= 0 &&
            newRow < 8 &&
            newCol >= 0 &&
            newCol < 8
        ) {
            const target = currentPosition[newRow][newCol];

            if (!target) {
                moves.push([newRow, newCol]);
            } else {
                moves.push([newRow, newCol]);
                break;
            }

            newRow += rowDirection;
            newCol += colDirection;
        }
    }

    return moves;
}

function getSlidingMoves(row, col, directions) {
    const moves = [];
    const piece = currentPosition[row][col];

    if (!piece) {
        return moves;
    }

    for (const [rowDirection, colDirection] of directions) {
        let newRow = row + rowDirection;
        let newCol = col + colDirection;

        while (
            newRow >= 0 &&
            newRow < 8 &&
            newCol >= 0 &&
            newCol < 8
        ) {
            const target = currentPosition[newRow][newCol];

            if (!target) {
                moves.push([newRow, newCol]);
            } else {
                if (target[0] !== piece[0]) {
                    moves.push([newRow, newCol]);
                }

                break;
            }

            newRow += rowDirection;
            newCol += colDirection;
        }
    }

    return moves;
}

function getAttackSquares(row, col) {
    const piece = currentPosition[row][col];

    if (!piece) {
        return [];
    }

    const moves = [];

    if (piece === "wK" || piece === "bK") {
        const directions = [[0, 1],[0, -1],[-1, 0],[1, 0],[1, 1],[1, -1],[-1, 1],[-1, -1],];

        for (const [rowDirection, colDirection] of directions) {
            let newRow = row + rowDirection;
            let newCol = col + colDirection;

            if (
                newRow >= 0 &&
                newRow < 8 &&
                newCol >= 0 &&
                newCol < 8
            ) {
                const target = currentPosition[newRow][newCol];
                moves.push([newRow, newCol]);
            }
        }

        return moves;
    }

    if (piece === "wN" || piece === "bN") {
        const directions = [[2, 1],[2, -1],[-2, 1],[-2, -1],[1, 2],[1, -2],[-1, 2],[-1, -2],];

        for (const [rowDirection, colDirection] of directions) {
            let newRow = row + rowDirection;
            let newCol = col + colDirection;

            if (
                newRow >= 0 &&
                newRow < 8 &&
                newCol >= 0 &&
                newCol < 8
            ) {
                const target = currentPosition[newRow][newCol];
                moves.push([newRow, newCol]);
            }
        }

        return moves;
    }

    if (piece === "wR" || piece === "bR") {
        return getSlidingAttacks(row, col, [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1]
        ]);
    }

    if (piece === "wB" || piece === "bB") {
        return getSlidingAttacks(row, col, [
            [1, 1],
            [-1, 1],
            [-1, -1],
            [1, -1]
        ]);
    }

    if (piece === "wQ" || piece === "bQ") {
        return getSlidingAttacks(row, col, [
            [1, 1],
            [-1, 1],
            [-1, -1],
            [1, -1],
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1]
        ]);
    }

    if (piece === "wP" || piece === "bP") {
        const direction = piece === "wP" ? -1 : 1;
        const oneRow = row + direction;

        for (const columnChange of [-1, 1]) {
            const targetCol = col + columnChange;

            if (
                oneRow >= 0 &&
                oneRow < 8 &&
                targetCol >= 0 &&
                targetCol < 8
            ) {
                const target = currentPosition[oneRow][targetCol];
                moves.push([oneRow, targetCol]);
            }
        }
    }

    return moves;
}

function isSquareAttacked(row, col, byColor) {
    for (let pieceRow = 0; pieceRow < 8; pieceRow++) {
        for (let pieceCol = 0; pieceCol < 8; pieceCol++) {
            const piece = currentPosition[pieceRow][pieceCol];

            if (!piece || piece[0] !== byColor) {
                continue;
            }

            const attacks = getAttackSquares(pieceRow, pieceCol);

            if (
                attacks.some(
                    ([attackRow, attackCol]) =>
                        attackRow === row && attackCol === col
                )
            ) {
                return true;
            }
        }
    }

    return false;
}

function findKing(color) {
    const king = color + "K";

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (currentPosition[row][col] === king) {
                return [row, col];
            }
        }
    }

    return null;
}

function getCastlingMoves(row, col) {
    const moves = [];
    const piece = currentPosition[row][col];

    if (piece !== "wK" && piece !== "bK") {
        return moves;
    }

    const color = piece[0];
    const enemyColor = color === "w" ? "b" : "w";

    if (((color === "w" && castlingRights.wK === true) || (color === "b" && castlingRights.bK === true) && currentPosition[row][7] === color + "R") && 
        !isSquareAttacked(row,4,enemyColor) && 
        !isSquareAttacked(row,5,enemyColor) && 
        !isSquareAttacked(row,6,enemyColor)) {
        const squareA = currentPosition[row][5];
        const squareB = currentPosition[row][6];
        if (!squareA && !squareB) {
            moves.push([row, 6]);
        }
    }

    if (((color === "w" && castlingRights.wQ === true) || (color === "b" && castlingRights.bQ === true) && currentPosition[row][0] === color + "R") && 
        !isSquareAttacked(row,4,enemyColor) && 
        !isSquareAttacked(row,3,enemyColor) && 
        !isSquareAttacked(row,2,enemyColor)) {
        const squareA = currentPosition[row][3];
        const squareB = currentPosition[row][2];
        const squareC = currentPosition[row][1];
        if (!squareA && !squareB && !squareC) {
            moves.push([row, 2]);
        }
    }
    
    return moves;
}

function isInCheck(color) {
    const kingPosition = findKing(color);

    if (!kingPosition) {
        return false;
    }

    const [kingRow, kingCol] = kingPosition;

    const enemyColor = color === "w" ? "b" : "w";

    return isSquareAttacked(kingRow, kingCol, enemyColor);
}

function moveLeavesKingInCheck(fromRow, fromCol, toRow, toCol) {
    const movingPiece = currentPosition[fromRow][fromCol];
    const capturedPiece = currentPosition[toRow][toCol];

    // Make the temporary move
    currentPosition[toRow][toCol] = movingPiece;
    currentPosition[fromRow][fromCol] = null;

    const inCheck = isInCheck(movingPiece[0]);

    // Undo the move
    currentPosition[fromRow][fromCol] = movingPiece;
    currentPosition[toRow][toCol] = capturedPiece;

    return inCheck;
}

function getPseudoLegalMoves(row, col) {
    const piece = currentPosition[row][col];

    if (!piece) {
        return [];
    }

    const moves = [];

    if (piece === "wK" || piece === "bK") {
        const directions = [[0, 1],[0, -1],[-1, 0],[1, 0],[1, 1],[1, -1],[-1, 1],[-1, -1],];

        for (const [rowDirection, colDirection] of directions) {
            let newRow = row + rowDirection;
            let newCol = col + colDirection;

            if (
                newRow >= 0 &&
                newRow < 8 &&
                newCol >= 0 &&
                newCol < 8
            ) {
                const target = currentPosition[newRow][newCol];

                if (!target) {
                    moves.push([newRow, newCol]);
                } else {
                    if (target[0] !== piece[0]) {
                        moves.push([newRow, newCol]);
                    }
                }
            }
        }

        moves.push(...getCastlingMoves(row, col));
        
        return moves;
    }

    if (piece === "wN" || piece === "bN") {
        const directions = [[2, 1],[2, -1],[-2, 1],[-2, -1],[1, 2],[1, -2],[-1, 2],[-1, -2],];

        for (const [rowDirection, colDirection] of directions) {
            let newRow = row + rowDirection;
            let newCol = col + colDirection;

            if (
                newRow >= 0 &&
                newRow < 8 &&
                newCol >= 0 &&
                newCol < 8
            ) {
                const target = currentPosition[newRow][newCol];

                if (!target) {
                    moves.push([newRow, newCol]);
                } else {
                    if (target[0] !== piece[0]) {
                        moves.push([newRow, newCol]);
                    }
                }
            }
        }

        return moves;
    }

    if (piece === "wR" || piece === "bR") {
        return getSlidingMoves(row, col, [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1]
        ]);
    }

    if (piece === "wB" || piece === "bB") {
        return getSlidingMoves(row, col, [
            [1, 1],
            [-1, 1],
            [-1, -1],
            [1, -1]
        ]);
    }

    if (piece === "wQ" || piece === "bQ") {
        return getSlidingMoves(row, col, [
            [1, 1],
            [-1, 1],
            [-1, -1],
            [1, -1],
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1]
        ]);
    }

    if (piece === "wP" || piece === "bP") {
        const direction = piece === "wP" ? -1 : 1;
        const startRow = piece === "wP" ? 6 : 1;

        const oneRow = row + direction;

        if (
            oneRow >= 0 &&
            oneRow < 8 &&
            currentPosition[oneRow][col] === null
        ) {
            moves.push([oneRow, col]);

            const twoRow = row + direction * 2;

            if (
                row === startRow &&
                currentPosition[twoRow][col] === null
            ) {
                moves.push([twoRow, col]);
            }
        }

        for (const columnChange of [-1, 1]) {
            const targetCol = col + columnChange;

            if (
                oneRow >= 0 &&
                oneRow < 8 &&
                targetCol >= 0 &&
                targetCol < 8
            ) {
                const target = currentPosition[oneRow][targetCol];

                if (
                    target &&
                    target[0] !== piece[0]
                ) {
                    moves.push([oneRow, targetCol]);
                }
            }
        }
    }

    return moves;
}

function getLegalMoves(row, col) {
    const moves = getPseudoLegalMoves(row, col);

    return moves.filter(([moveRow, moveCol]) => {
        return !moveLeavesKingInCheck(
            row,
            col,
            moveRow,
            moveCol
        );
    });
}

function hasLegalMoves(color) {
    for (let pieceRow = 0; pieceRow < 8; pieceRow++) {
        for (let pieceCol = 0; pieceCol < 8; pieceCol++) {
            const piece = currentPosition[pieceRow][pieceCol];

            if (!piece || piece[0] !== color) {
                continue;
            }

            const moves = getLegalMoves(pieceRow, pieceCol);

            if (moves.length > 0) {
                return true;
            }
        }
    }

    return false;
}

function isCheckmate(color) {
    return isInCheck(color) && !hasLegalMoves(color);
}

function isStalemate(color) {
    return !isInCheck(color) && !hasLegalMoves(color);
}

function clearMoveHighlights() {
    squares.forEach(square => {
        square.classList.remove("move-option");
    });
}

function showMoveHighlights(moves) {
    clearMoveHighlights();

    for (const [row, col] of moves) {
        const index = row * 8 + col;
        squares[index].classList.add("move-option");
    }
}

squares.forEach((square, index) => {
    square.addEventListener("click", () => {
        const row = Math.floor(index / 8);
        const col = index % 8;

        if (!selectedSquare) {
            const piece = currentPosition[row][col];

            if (piece && piece[0] === currentTurn) {
                selectedSquare = square;
                square.classList.add("selected");

                const legalMoves = getLegalMoves(row, col);
                showMoveHighlights(legalMoves);
            }

            return;
        }

        const selectedIndex = [...squares].indexOf(selectedSquare);
        const selectedRow = Math.floor(selectedIndex / 8);
        const selectedCol = selectedIndex % 8;

        const legalMoves = getLegalMoves(selectedRow, selectedCol);

        const isLegal = legalMoves.some(
            ([moveRow, moveCol]) =>
                moveRow === row && moveCol === col
        );

        if (isLegal) {

            updateCastlingRights(
                selectedRow,
                selectedCol,
                row,
                col
            );
            
            currentPosition[row][col] =
            currentPosition[selectedRow][selectedCol];

            currentPosition[selectedRow][selectedCol] = null;

            if (
                currentPosition[row][col] === "wP" && row === 0
            ) {
                promotePawn(row, col);
            }

            if (
                currentPosition[row][col] === "bP" && row === 7
            ) {
                promotePawn(row, col);
            }

            const piece = selectedSquare.querySelector("img");

            const capturedPiece = square.querySelector("img");

            if (capturedPiece) {
                capturedPiece.remove();
            }

            square.appendChild(piece);

            piece.src = pieces[currentPosition[row][col]];
            piece.alt = currentPosition[row][col];

            currentTurn = currentTurn === "w" ? "b" : "w";

            if (isCheckmate(currentTurn)) {
                console.log("Checkmate!");
            }

            if (isStalemate(currentTurn)) {
                console.log("Stalemate!");
            }
        }

        selectedSquare.classList.remove("selected");
        clearMoveHighlights();
        selectedSquare = null;    
    });
});
