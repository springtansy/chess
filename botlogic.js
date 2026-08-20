const bots = {
    random: randomBotMove,
    greedy: greedyBotMove,
    piecetable: piecetableBotMove,
};

const pieceValues = {
    P: 100,
    N: 300,
    B: 300,
    R: 500,
    Q: 900,
    K: 100000000
};

const PAWN_TABLE = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
];

const KNIGHT_TABLE = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];

const KING_OPENING_TABLE = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [20, 20,  0,  0,  0,  0, 20, 20],
  [20, 30, 10,  0,  0, 10, 30, 20]
];

const BISHOP_TABLE = [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
];

const ROOK_TABLE = [
    [ 0,  0,  0,  0,  0,  0,  0,  0],
    [ 5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [ 0,  0,  0,  5,  5,  0,  0,  0]
];

const QUEEN_TABLE = [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [ -5,  0,  5,  5,  5,  5,  0, -5],
    [  0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
];

const pstTables = {
    P: PAWN_TABLE,
    N: KNIGHT_TABLE,
    B: BISHOP_TABLE,
    R: ROOK_TABLE,
    Q: QUEEN_TABLE,
    K: KING_OPENING_TABLE
};

function getPieceSquareValue(pieceStr, row, col) {
    const color = pieceStr[0]; // 'w' or 'b'
    const type = pieceStr[1];  // 'P', 'N', 'B', etc.
    
    const table = pstTables[type];
    if (!table) return 0;

    // Flip the row for Black pieces
    const tableRow = (color === 'w') ? row : (7 - row);
    
    return table[tableRow][col];
}

function makeBotMove(botName) {
    const bot = bots[botName] || randomBotMove;

    const move = bot(currentTurn);

    if (!move) {
        return;
    }

    const { from, to, promotion } = move;

    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;

    const movingPiece = currentPosition[fromRow][fromCol];

    movePiece(
        fromRow,
        fromCol,
        toRow,
        toCol,
        promotion
    );

    renderBoard();

    completeMove(
        fromRow,
        fromCol,
        toRow,
        toCol,
        movingPiece
    );
}

function getAllLegalMoves(color) {
    const moves = [];

    for (let pieceRow = 0; pieceRow < 8; pieceRow++) {
        for (let pieceCol = 0; pieceCol < 8; pieceCol++) {
            const piece = currentPosition[pieceRow][pieceCol];

            if (!piece || piece[0] !== color) {
                continue;
            }

            const pieceMoves = getLegalMoves(pieceRow, pieceCol);

            for (const move of pieceMoves) {
                const [toRow, toCol] = move;

                const isPromotion =
                    piece[1] === "P" &&
                    (toRow === 0 || toRow === 7);

                if (isPromotion) {
                    for (const promotion of ["Q", "R", "B", "N"]) {
                        moves.push({
                            from: [pieceRow, pieceCol],
                            to: [toRow, toCol],
                            promotion: promotion
                        });
                    }
                } else {
                    moves.push({
                        from: [pieceRow, pieceCol],
                        to: [toRow, toCol],
                        promotion: null
                    });
                }
            }
        }
    }

    return moves;
}

function getRandomMove(moves) {
    const randomMove = moves[Math.floor(Math.random() * moves.length)];

    return randomMove;
}

function randomBotMove(color) {
    const moves = getAllLegalMoves(color);
    const move = getRandomMove(moves);

    return move;
}

function greedyBotMove(color) {
    const moves = getAllLegalMoves(color);

    let bestValue = -Infinity;
    let bestMoves = [];

    for (const move of moves) {
        const [toRow, toCol] = move.to;
        const capturedPiece = currentPosition[toRow][toCol];

        let value = 0;

        if (capturedPiece) {
            value += pieceValues[capturedPiece[1]];
        }

        if (move.promotion) {
            value = value + pieceValues[move.promotion] -1;
        }

        if (value > bestValue) {
            bestValue = value;
            bestMoves = [move];
        } else if (value === bestValue) {
            bestMoves.push(move);
        }
    }

    return getRandomMove(bestMoves);
}

function piecetableBotMove(color) {
    const moves = getAllLegalMoves(color);

    let bestValue = -Infinity;
    let bestMoves = [];

    for (const move of moves) {
        const [fromRow, fromCol] = move.from;
        const [toRow, toCol] = move.to;

        const movingPiece = currentPosition[fromRow][fromCol];
        const movingType = movingPiece[1];
        const capturedPiece = currentPosition[toRow][toCol];

        let value = 0;

        const fromPst = getPieceSquareValue(
            movingPiece,
            fromRow,
            fromCol
        );

        let toPst = getPieceSquareValue(
            movingPiece,
            toRow,
            toCol
        );

        // Promotion
        if (move.promotion) {
            const promoType = move.promotion.toUpperCase();
            const promoPiece = color + promoType;

            value += pieceValues[promoType] - pieceValues[movingType];

            toPst = getPieceSquareValue(
                promoPiece,
                toRow,
                toCol
            );
        }

        // Moving piece's PST improvement
        value += toPst - fromPst;

        // Capture
        if (capturedPiece) {
            const capturedType = capturedPiece[1];

            value += pieceValues[capturedType];

            // Remove the captured piece's positional contribution
            value -= getPieceSquareValue(
                capturedPiece,
                toRow,
                toCol
            );
        }

        if (value > bestValue) {
            bestValue = value;
            bestMoves = [move];
        } else if (value === bestValue) {
            bestMoves.push(move);
        }
    }

    return getRandomMove(bestMoves);
}

startBotIfNeeded();
