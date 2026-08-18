function makeBotMove(botName) {
    const bots = {
        random: randomBotMove,
    };
    const move = getRandomMove(currentTurn);

    const {from, to, promotion} = move;
    
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;

    const movingPiece = currentPosition[fromRow][fromCol];

    movePiece(fromRow,fromCol,toRow,toCol,promotion)
    renderBoard()
    completeMove(fromRow,fromCol,toRow,toCol,movingPiece)
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
