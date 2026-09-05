const { Server } = require("socket.io");

// In-memory seat locks store: showId -> { seatNo: { socketId, userId, expiresAt } }
const seatLocks = {};
const LOCK_DURATION_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Clean up expired seat locks for a show
 */
const cleanupExpiredLocks = (showId) => {
    if (!seatLocks[showId]) return;
    const now = Date.now();
    for (const seatNo in seatLocks[showId]) {
        if (seatLocks[showId][seatNo].expiresAt < now) {
            delete seatLocks[showId][seatNo];
        }
    }
};

/**
 * Get simple map of currently locked seats for a show
 */
const getLockedSeatsMap = (showId) => {
    cleanupExpiredLocks(showId);
    if (!seatLocks[showId]) return {};

    const activeLocks = {};
    for (const seatNo in seatLocks[showId]) {
        activeLocks[seatNo] = {
            userId: seatLocks[showId][seatNo].userId,
            socketId: seatLocks[showId][seatNo].socketId
        };
    }
    return activeLocks;
};

const initSocketServer = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        let currentShowId = null;
        let currentUserId = null;

        // Join show room
        socket.on("join_show", ({ showId, userId }) => {
            currentShowId = showId;
            currentUserId = userId;
            const roomName = `show_${showId}`;
            socket.join(roomName);

            // Send current locked seats to the newly joined client
            const lockedSeats = getLockedSeatsMap(showId);
            socket.emit("seat_locks_updated", lockedSeats);
        });

        // Lock a seat
        socket.on("lock_seat", ({ showId, seatNo, userId }) => {
            if (!showId || !seatNo) return;

            cleanupExpiredLocks(showId);
            if (!seatLocks[showId]) seatLocks[showId] = {};

            // If already locked by someone else, ignore
            if (seatLocks[showId][seatNo] && seatLocks[showId][seatNo].socketId !== socket.id) {
                socket.emit("seat_lock_failed", { seatNo, message: "Seat already locked by another user" });
                return;
            }

            seatLocks[showId][seatNo] = {
                socketId: socket.id,
                userId: userId || "guest",
                expiresAt: Date.now() + LOCK_DURATION_MS
            };

            const roomName = `show_${showId}`;
            io.to(roomName).emit("seat_locks_updated", getLockedSeatsMap(showId));
        });

        // Unlock a seat
        socket.on("unlock_seat", ({ showId, seatNo }) => {
            if (!showId || !seatNo || !seatLocks[showId]) return;

            if (seatLocks[showId][seatNo] && seatLocks[showId][seatNo].socketId === socket.id) {
                delete seatLocks[showId][seatNo];
                const roomName = `show_${showId}`;
                io.to(roomName).emit("seat_locks_updated", getLockedSeatsMap(showId));
            }
        });

        // Handle disconnect - unlock seats locked by this socket
        socket.on("disconnect", () => {
            if (currentShowId && seatLocks[currentShowId]) {
                let changed = false;
                for (const seatNo in seatLocks[currentShowId]) {
                    if (seatLocks[currentShowId][seatNo].socketId === socket.id) {
                        delete seatLocks[currentShowId][seatNo];
                        changed = true;
                    }
                }
                if (changed) {
                    io.to(`show_${currentShowId}`).emit("seat_locks_updated", getLockedSeatsMap(currentShowId));
                }
            }
        });
    });

    console.log("⚡ Real-time Socket.io Server Initialized");
    return io;
};

module.exports = {
    initSocketServer,
    getLockedSeatsMap
};
