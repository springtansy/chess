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

for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {

        const square = document.createElement("div");

        square.classList.add("square");

        if ((row + col) % 2 === 0) {
            square.classList.add("light");
        } else {
            square.classList.add("dark");
        }

        const piece = startingPosition[row][col];

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

const squares = document.querySelectorAll(".square");

function promotePawn(row, col) {
    const pawn = startingPosition[row][col];

    if (pawn !== "wP" && pawn !== "bP") {
        return;
    }

    // Promote to a queen
    const promotedPiece = pawn[0] === "w" ? "wQ" : "bQ";

    startingPosition[row][col] = promotedPiece;
}

function getSlidingMoves(row, col, directions) {
    const moves = [];
    const piece = startingPosition[row][col];

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
            const target = startingPosition[newRow][newCol];

            // Empty square — keep going
            if (!target) {
                moves.push([newRow, newCol]);
            } else {
                // Enemy piece — can capture, but can't go farther
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

function getLegalMoves(row, col) {
    const piece = startingPosition[row][col];

    if (!piece) {
        return [];
    }

    const moves = [];

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

        // One square forward
        const oneRow = row + direction;

        if (
            oneRow >= 0 &&
            oneRow < 8 &&
            startingPosition[oneRow][col] === null
        ) {
            moves.push([oneRow, col]);

            // Two squares forward from starting position
            const twoRow = row + direction * 2;

            if (
                row === startRow &&
                startingPosition[twoRow][col] === null
            ) {
                moves.push([twoRow, col]);
            }
        }

        // Diagonal captures
        for (const columnChange of [-1, 1]) {
            const targetCol = col + columnChange;

            if (
                oneRow >= 0 &&
                oneRow < 8 &&
                targetCol >= 0 &&
                targetCol < 8
            ) {
                const target = startingPosition[oneRow][targetCol];

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

squares.forEach((square, index) => {
    square.addEventListener("click", () => {
        const row = Math.floor(index / 8);
        const col = index % 8;

        // Selecting a piece
        if (!selectedSquare) {
            if (startingPosition[row][col]) {
                selectedSquare = square;
                square.classList.add("selected");
            }

            return;
        }

        // Find the selected square's coordinates
        const selectedIndex = [...squares].indexOf(selectedSquare);
        const selectedRow = Math.floor(selectedIndex / 8);
        const selectedCol = selectedIndex % 8;

        const legalMoves = getLegalMoves(selectedRow, selectedCol);

        const isLegal = legalMoves.some(
            ([moveRow, moveCol]) =>
                moveRow === row && moveCol === col
        );

        if (isLegal) {
            // Move the piece in the game state
            startingPosition[row][col] =
            startingPosition[selectedRow][selectedCol];

            startingPosition[selectedRow][selectedCol] = null;

            // Promote pawns that reach the last rank
            if (
                startingPosition[row][col] === "wP" && row === 0
            ) {
                promotePawn(row, col);
            }

            if (
                startingPosition[row][col] === "bP" && row === 7
            ) {
                promotePawn(row, col);
            }

            // Update the visual board
            const piece = selectedSquare.querySelector("img");

            const capturedPiece = square.querySelector("img");

            if (capturedPiece) {
                capturedPiece.remove();
            }

            square.appendChild(piece);

            piece.src = pieces[startingPosition[row][col]];
            piece.alt = startingPosition[row][col];
        }

        selectedSquare.classList.remove("selected");
        selectedSquare = null;
    });
});
