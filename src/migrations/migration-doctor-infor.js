'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('doctor_infor', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        doctorId: {
            allowNull: false,
            type: Sequelize.INTEGER
        },
        specialtyId: {
            type: Sequelize.INTEGER
        },
        clinicId: {
            type: Sequelize.INTEGER
        },
        priceId: {
            allowNull: false,
            type: Sequelize.STRING
        },
        provinceId: {
            allowNull: false,
            type: Sequelize.STRING
        },
        paymentId: {
            allowNull: false,
            type: Sequelize.STRING
        },
        addressClinic: {
            allowNull: false,
            type: Sequelize.STRING
        },
        nameClinic: {
            allowNull: false,
            type: Sequelize.STRING
        },
        note: {
            type: Sequelize.STRING
        },
        count: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue:0
        },
        createdAt: {
            allowNull: false,
            type: Sequelize.DATE
        },
        updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
        }
    });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('doctor_infor');
    }
};