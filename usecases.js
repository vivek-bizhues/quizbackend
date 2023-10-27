const mongoose = require('mongoose');

const useCaseSchema = new mongoose.Schema(
    [
      {
        useCase: String,
        subjectArea: String,
        useCaseOverview: String,
      },
    ]
  );

module.exports = mongoose.model('UseCase', useCaseSchema);
