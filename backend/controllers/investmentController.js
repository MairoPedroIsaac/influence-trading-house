import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

/**
 * Creates a new investment and initiates AI trading simulation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createInvestment = async (req, res) => {
  try {
    // Create initial investment with AI processing status
    const investment = await prisma.investment.create({
      data: {
        ...req.body,
        aiVersion: 'InfluenceX AI v1.0',
        status: 'AI Processing'
      }
    });

    // Simulate AI trading results
    const aiResult = simulateAITrades(investment.amount, investment.fundId);
    
    // Update investment with AI results
    const updatedInvestment = await prisma.investment.update({
      where: { id: investment.id },
      data: { status: "Active", ...aiResult }
    });

    res.status(201).json({
      status: 'success',
      message: 'InfluenceX AI has initiated your trade.',
      data: updatedInvestment,
      nextSteps: 'Monitor your dashboard for AI updates',
      ai: 'InfluenceX AI'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'AI trading session failed',
      ai: 'InfluenceX AI',
      error: error.message
    });
  }
};

/**
 * Retrieves all investments with related contact and fund data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getInvestments = async (req, res) => {
  try {
    const investments = await prisma.investment.findMany({
      include: { contact: true, fund: true }
    });
    
    res.json({
      status: 'success',
      message: 'All investments retrieved by InfluenceX AI',
      data: investments,
      ai: 'InfluenceX AI'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve investments',
      ai: 'InfluenceX AI',
      error: error.message
    });
  }
};

/**
 * Updates investment status and profit
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateInvestmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, profit } = req.body;

    // Validate status against allowed values
    const validStatuses = ['Pending', 'Active', 'Completed', 'Failed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status. Use: Pending, Active, Completed, Failed',
        ai: 'InfluenceX AI' // Added missing AI field
      });
    }

    // Validate profit is numeric
    if (profit && isNaN(Number(profit))) {
      return res.status(400).json({
        status: 'error',
        message: 'Profit must be a number',
        ai: 'InfluenceX AI' // Added missing AI field
      });
    }

    // Partial update - only modifies provided fields
    const updatedInvestment = await prisma.investment.update({
      where: { id },
      data: {
        status: status || undefined,
        profit: profit ? Number(profit) : undefined
      }
    });

    res.json({
      status: 'success',
      message: 'Investment updated by InfluenceX AI',
      data: updatedInvestment,
      ai: 'InfluenceX AI'
    });
  } catch (error) {
    // Handle specific Prisma not found error
    if (error.code === 'P2025') {
      res.status(404).json({
        status: 'error',
        message: 'Investment not found',
        ai: 'InfluenceX AI'
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to update investment',
        ai: 'InfluenceX AI',
        error: error.message
      });
    }
  }
};

/**
 * Simulates AI trading results
 * @param {number} amount - Investment amount
 * @param {string} fundId - Fund ID
 * @returns {Object} AI trading results
 */
function simulateAITrades(amount, fundId) {
  // Basic profit calculation (15% of investment)
  return { profit: amount * 0.15 };
}
