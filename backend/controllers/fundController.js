import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const formatResponse = (data, message = '') => ({
  status: 'success',
  message,
  data,
  timestamp: new Date().toISOString(),
  ai: 'InfluenceX AI'
});

// 1. Get All Funds
export const getFunds = async (req, res) => {
  try {
    const funds = await prisma.fund.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(formatResponse(funds, 'Active funds retrieved by InfluenceX AI'));
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve trading funds',
      ai: 'InfluenceX AI',
      error: error.message
    });
  }
};

// 2. Create New Fund
export const createFund = async (req, res) => {
  try {
    const fund = await prisma.fund.create({
      data: {
        ...req.body,
        aiVersion: 'InfluenceX AI v1.0'
      }
    });
    res.status(201).json(formatResponse(fund, 'Trading fund launched by InfluenceX AI'));
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to activate trading fund',
      ai: 'InfluenceX AI',
      error: error.message
    });
  }
};

// 3. Update Existing Fund
export const updateFund = async (req, res) => {
  try {
    const updatedFund = await prisma.fund.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(formatResponse(updatedFund, 'Fund updated by InfluenceX AI'));
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update fund',
      ai: 'InfluenceX AI',
      error: error.message
    });
  }
};

// 4. Delete Fund
export const deleteFund = async (req, res) => {
  try {
    await prisma.fund.delete({
      where: { id: req.params.id }
    });
    res.json(formatResponse(null, 'Fund deactivated by InfluenceX AI'));
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete fund',
      ai: 'InfluenceX AI',
      error: error.message
    });
  }
};
