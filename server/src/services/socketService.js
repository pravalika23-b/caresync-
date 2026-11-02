let ioInstance = null;

function initSocket(io) {
  ioInstance = io;

  io.on('connection', (socket) => {
    // console.log(`🔌 Client connected: ${socket.id}`);

    // Join doctor's dedicated room
    socket.on('join:doctor', (doctorId) => {
      socket.join(`doctor_${doctorId}`);
    });

    // Join patient's personal room
    socket.on('join:patient', (userId) => {
      socket.join(`patient_${userId}`);
    });

    // Join admin dashboard room
    socket.on('join:admin', () => {
      socket.join('global_admin');
    });

    socket.on('disconnect', () => {
      // console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  return ioInstance;
}

function emitQueueUpdate(doctorId, payload) {
  if (ioInstance) {
    ioInstance.to(`doctor_${doctorId}`).emit('queue:update', payload);
    ioInstance.to('global_admin').emit('queue:update', { doctorId, ...payload });
  }
}

function emitPatientAlert(userId, eventName, payload) {
  if (ioInstance) {
    ioInstance.to(`patient_${userId}`).emit(eventName, payload);
  }
}

function emitAdminRefresh(payload) {
  if (ioInstance) {
    ioInstance.to('global_admin').emit('admin:stats_refresh', payload);
  }
}

module.exports = {
  initSocket,
  getIO,
  emitQueueUpdate,
  emitPatientAlert,
  emitAdminRefresh
};
