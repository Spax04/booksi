'use strict';
module.exports = (sequelize: any, DataTypes: any) => {
  const subscriptions = sequelize.define('subscriptions', {
    shopName: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    installedAt: DataTypes.DATE,
    installationStatus: DataTypes.STRING,
    chargeStatus: DataTypes.STRING,
    chargeId: DataTypes.STRING,
    subscribed: DataTypes.BOOLEAN,
    inTrial: DataTypes.BOOLEAN,
    subscription: DataTypes.JSON,
    planName: DataTypes.STRING,
    planDisplayName: DataTypes.STRING,
    isDev: DataTypes.BOOLEAN,
    pricePerMonth: DataTypes.DECIMAL,
    pricePerEmployee: DataTypes.DECIMAL,
    nextRefund: DataTypes.DECIMAL,
    billingCap: DataTypes.DECIMAL,
    teamCap: DataTypes.INTEGER,
    subscriptionPlanName: DataTypes.STRING,
    chargePer: DataTypes.STRING,
    license: DataTypes.JSONB,
    installation: DataTypes.JSONB,
    unInstalled: DataTypes.BOOLEAN,
    unInstalledAt: DataTypes.DATE
  }, {timestamps: false, freezeTableName: true});
  subscriptions.associate = function(models: any) {
    // associations can be defined here
  };
  return subscriptions;
};

/*
  @installationStatus: DataTypes.STRING
  "onBoarding" - after approving charges, before install - register (redirect to onboarding)
  "installed" - after install - register (redirect to Login)

  @subscribed: DataTypes.BOOLEAN -> installationStatus == "installed"

  @chargeStatus: DataTypes.STRING
  'active' at the end of Installation

  @inTrial: DataTypes.BOOLEAN -> trialDays (different model) > 0
 */
