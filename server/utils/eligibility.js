// server/utils/eligibility.js
// Donor age & cooldown eligibility + Blood compatibility

// 1. Calculate age from Date of Birth
function calculateAge(dob) {
  if (!dob) return null;
  const ageDifMs = Date.now() - new Date(dob).getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

// 2. Check if donor is eligible (Age 18-65 & 90 days gap)
function checkEligibility(user, gapDays = 90) {
  if (!user) return { isEligible: false, reason: 'User not found' };

  const age = calculateAge(user.dateOfBirth);
  if (age !== null && age < 18) {
    return { isEligible: false, age, reason: 'Age must be 18 or above' };
  }
  if (age !== null && age > 65) {
    return { isEligible: false, age, reason: 'Age must be 65 or below' };
  }

  // Check cooldown if donated before
  if (user.lastDonationDate) {
    const diffDays = Math.floor((Date.now() - new Date(user.lastDonationDate)) / (1000 * 60 * 60 * 24));
    if (diffDays < gapDays) {
      const remaining = gapDays - diffDays;
      return {
        isEligible: false,
        age,
        daysSinceLastDonation: diffDays,
        reason: `Need to wait ${remaining} more days (${gapDays} days gap required)`,
      };
    }
    return { isEligible: true, age, daysSinceLastDonation: diffDays, reason: 'Eligible to donate!' };
  }

  return { isEligible: true, age, reason: 'Eligible to donate!' };
}

// 3. Blood Group Compatibility Chart
const COMPATIBLE_DONORS = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal recipient
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'], // Universal donor
};

function getCompatibleGroups(group) {
  return COMPATIBLE_DONORS[group] || [];
}

module.exports = {
  calculateAge,
  checkEligibility,
  getCompatibleGroups,
  COMPATIBLE_DONORS,
};
