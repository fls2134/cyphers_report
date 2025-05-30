const router = require("express").Router();
const axios = require("axios");

const API_KEY = "c6Blj3ULVLUNRKImWq0KAHJeWnPWyR7T";
const BASE_URL = "https://api.neople.co.kr";

// 기본 API 엔드포인트
router.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "API 서버가 정상적으로 동작 중입니다.",
    endpoints: {
      main: "/api",
      status: "/api/status",
      data: "/api/data",
    },
  });
});

// 상태 확인 엔드포인트
router.get("/status", (req, res) => {
  res.json({
    status: "success",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 데이터 엔드포인트
router.get("/data", (req, res) => {
  res.json({
    status: "success",
    data: {
      sample: "테스트 데이터",
    },
  });
});

// 플레이어 검색
router.post("/cyphers/cy/players", async (req, res) => {
  try {
    const { nickname, wordType = "match", limit = 10 } = req.body;

    if (!nickname) {
      return res.status(400).json({ error: "닉네임은 필수 입력값입니다." });
    }

    const url = `${BASE_URL}/cy/players`;
    console.log("Request URL:", url);
    console.log("Request Params:", { nickname, wordType, limit });

    const response = await axios({
      method: "get",
      url: url,
      params: {
        nickname,
        wordType,
        limit,
        apikey: API_KEY,
      },
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      validateStatus: function (status) {
        return status >= 200 && status < 500;
      },
    });

    console.log("Response Status:", response.status);
    console.log("Response Headers:", response.headers);
    console.log("Response Data:", response.data);

    if (response.status === 200 && response.data) {
      res.json({
        status: "success",
        data: response.data,
      });
    } else {
      res.status(response.status).json({
        status: "error",
        message: "플레이어를 찾을 수 없습니다.",
        details: response.data,
      });
    }
  } catch (error) {
    console.error("API Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    res.status(500).json({
      status: "error",
      message: "API 요청 중 오류가 발생했습니다.",
      error: error.response?.data || error.message,
    });
  }
});

// 플레이어 정보 조회
router.post("/cyphers/cy/players/:playerId", async (req, res) => {
  try {
    const { playerId } = req.params;
    console.log("Requesting player info for ID:", playerId);

    const url = `${BASE_URL}/cy/players/${playerId}`;
    console.log("Request URL:", url);

    const response = await axios({
      method: "get",
      url: url,
      params: {
        apikey: API_KEY,
      },
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      validateStatus: function (status) {
        return status >= 200 && status < 500;
      },
    });

    console.log("Response Status:", response.status);
    console.log("Response Headers:", response.headers);
    console.log("Response Data:", response.data);

    if (response.status === 200 && response.data) {
      res.json({
        status: "success",
        data: response.data,
      });
    } else {
      res.status(response.status).json({
        status: "error",
        message: "플레이어 정보를 찾을 수 없습니다.",
        details: response.data,
      });
    }
  } catch (error) {
    console.error("API Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    res.status(500).json({
      status: "error",
      message: "API 요청 중 오류가 발생했습니다.",
      error: error.response?.data || error.message,
    });
  }
});

// 플레이어 매칭 기록 조회
router.post("/cyphers/cy/players/:playerId/matches", async (req, res) => {
  try {
    const { playerId } = req.params;
    const { gameTypeId, startDate, endDate, limit = 10, next } = req.body;

    console.log("Requesting matches for player ID:", playerId);
    console.log("Request params:", {
      gameTypeId,
      startDate,
      endDate,
      limit,
      next,
    });

    const url = `${BASE_URL}/cy/players/${playerId}/matches`;
    console.log("Request URL:", url);

    const response = await axios({
      method: "get",
      url: url,
      params: {
        gameTypeId,
        startDate,
        endDate,
        limit,
        next,
        apikey: API_KEY,
      },
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      validateStatus: function (status) {
        return status >= 200 && status < 500;
      },
    });

    console.log("Response Status:", response.status);
    console.log("Response Headers:", response.headers);
    console.log("Response Data:", JSON.stringify(response.data, null, 2));

    if (response.status === 200 && response.data) {
      // next 값이 있는지 확인
      console.log("Next value in response:", response.data.next);
      console.log("Rows in response:", response.data.rows?.length);
      console.log("Full response structure:", Object.keys(response.data));
      console.log("Response data type:", typeof response.data);
      console.log("Is next a string?", typeof response.data.next === "string");

      res.json({
        status: "success",
        data: response.data,
      });
    } else {
      res.status(response.status).json({
        status: "error",
        message: "매칭 기록을 찾을 수 없습니다.",
        details: response.data,
      });
    }
  } catch (error) {
    console.error("API Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    res.status(500).json({
      status: "error",
      message: "API 요청 중 오류가 발생했습니다.",
      error: error.response?.data || error.message,
    });
  }
});

// 매칭 상세 정보 조회
router.post("/cyphers/cy/matches/:matchId", async (req, res) => {
  try {
    const { matchId } = req.params;
    console.log("Requesting match details for ID:", matchId);

    const url = `${BASE_URL}/cy/matches/${matchId}`;
    console.log("Request URL:", url);

    const response = await axios({
      method: "get",
      url: url,
      params: {
        apikey: API_KEY,
      },
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      validateStatus: function (status) {
        return status >= 200 && status < 500;
      },
    });

    console.log("Response Status:", response.status);
    console.log("Response Headers:", response.headers);
    console.log("Response Data:", response.data);

    if (response.status === 200 && response.data) {
      res.json({
        status: "success",
        data: response.data,
      });
    } else {
      res.status(response.status).json({
        status: "error",
        message: "매칭 정보를 찾을 수 없습니다.",
        details: response.data,
      });
    }
  } catch (error) {
    console.error("API Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    res.status(500).json({
      status: "error",
      message: "API 요청 중 오류가 발생했습니다.",
      error: error.response?.data || error.message,
    });
  }
});

// 통합 랭킹 조회
router.post("/cyphers/cy/ranking/ratingpoint", async (req, res) => {
  try {
    const { playerId, offset = 0, limit = 10 } = req.body;
    console.log("Requesting rating ranking with params:", {
      playerId,
      offset,
      limit,
    });

    const url = `${BASE_URL}/cy/ranking/ratingpoint`;
    console.log("Request URL:", url);

    const response = await axios({
      method: "get",
      url: url,
      params: {
        playerId,
        offset,
        limit,
        apikey: API_KEY,
      },
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      validateStatus: function (status) {
        return status >= 200 && status < 500;
      },
    });

    console.log("Response Status:", response.status);
    console.log("Response Headers:", response.headers);
    console.log("Response Data:", response.data);

    if (response.status === 200 && response.data) {
      res.json({
        status: "success",
        data: response.data,
      });
    } else {
      res.status(response.status).json({
        status: "error",
        message: "랭킹 정보를 찾을 수 없습니다.",
        details: response.data,
      });
    }
  } catch (error) {
    console.error("API Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    res.status(500).json({
      status: "error",
      message: "API 요청 중 오류가 발생했습니다.",
      error: error.response?.data || error.message,
    });
  }
});

// 캐릭터 랭킹 조회
router.post(
  "/cyphers/cy/ranking/characters/:characterId/:rankingType",
  async (req, res) => {
    try {
      const { characterId, rankingType } = req.params;
      const { playerId, offset = 0, limit = 10 } = req.body;
      console.log("Requesting character ranking with params:", {
        characterId,
        rankingType,
        playerId,
        offset,
        limit,
      });

      const url = `${BASE_URL}/cy/ranking/characters/${characterId}/${rankingType}`;
      console.log("Request URL:", url);

      const response = await axios({
        method: "get",
        url: url,
        params: {
          playerId,
          offset,
          limit,
          apikey: API_KEY,
        },
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        validateStatus: function (status) {
          return status >= 200 && status < 500;
        },
      });

      console.log("Response Status:", response.status);
      console.log("Response Headers:", response.headers);
      console.log("Response Data:", response.data);

      if (response.status === 200 && response.data) {
        res.json({
          status: "success",
          data: response.data,
        });
      } else {
        res.status(response.status).json({
          status: "error",
          message: "캐릭터 랭킹 정보를 찾을 수 없습니다.",
          details: response.data,
        });
      }
    } catch (error) {
      console.error("API Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      res.status(500).json({
        status: "error",
        message: "API 요청 중 오류가 발생했습니다.",
        error: error.response?.data || error.message,
      });
    }
  }
);

// 투신전 랭킹 조회
router.post("/cyphers/cy/ranking/tsj/:tsjType", async (req, res) => {
  try {
    const { tsjType } = req.params;
    const { playerId, offset = 0, limit = 10 } = req.body;
    console.log("Requesting tsj ranking with params:", {
      tsjType,
      playerId,
      offset,
      limit,
    });

    const url = `${BASE_URL}/cy/ranking/tsj/${tsjType}`;
    console.log("Request URL:", url);

    const response = await axios({
      method: "get",
      url: url,
      params: {
        playerId,
        offset,
        limit,
        apikey: API_KEY,
      },
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      validateStatus: function (status) {
        return status >= 200 && status < 500;
      },
    });

    console.log("Response Status:", response.status);
    console.log("Response Headers:", response.headers);
    console.log("Response Data:", response.data);

    if (response.status === 200 && response.data) {
      res.json({
        status: "success",
        data: response.data,
      });
    } else {
      res.status(response.status).json({
        status: "error",
        message: "투신전 랭킹 정보를 찾을 수 없습니다.",
        details: response.data,
      });
    }
  } catch (error) {
    console.error("API Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    res.status(500).json({
      status: "error",
      message: "API 요청 중 오류가 발생했습니다.",
      error: error.response?.data || error.message,
    });
  }
});

// 아이템 검색
router.post("/cyphers/cy/battleitems", async (req, res) => {
  try {
    const {
      itemName,
      wordType = "match",
      limit = 10,
      characterId,
      slotCode,
      rarityCode,
      seasonCode,
    } = req.body;

    console.log("Requesting items with params:", {
      itemName,
      wordType,
      limit,
      characterId,
      slotCode,
      rarityCode,
      seasonCode,
    });

    const url = `${BASE_URL}/cy/battleitems`;
    console.log("Request URL:", url);

    const response = await axios({
      method: "get",
      url: url,
      params: {
        itemName,
        wordType,
        limit,
        characterId,
        slotCode,
        rarityCode,
        seasonCode,
        apikey: API_KEY,
      },
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      validateStatus: function (status) {
        return status >= 200 && status < 500;
      },
    });

    console.log("Response Status:", response.status);
    console.log("Response Headers:", response.headers);
    console.log("Response Data:", response.data);

    if (response.status === 200 && response.data) {
      res.json({
        status: "success",
        data: response.data,
      });
    } else {
      res.status(response.status).json({
        status: "error",
        message: "아이템을 찾을 수 없습니다.",
        details: response.data,
      });
    }
  } catch (error) {
    console.error("API Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    res.status(500).json({
      status: "error",
      message: "API 요청 중 오류가 발생했습니다.",
      error: error.response?.data || error.message,
    });
  }
});

// 아이템 상세 정보 조회
router.post("/cyphers/cy/battleitems/:itemId", async (req, res) => {
  try {
    const { itemId } = req.params;
    console.log("Requesting item details for ID:", itemId);

    const url = `${BASE_URL}/cy/battleitems/${itemId}`;
    console.log("Request URL:", url);

    const response = await axios({
      method: "get",
      url: url,
      params: {
        apikey: API_KEY,
      },
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      validateStatus: function (status) {
        return status >= 200 && status < 500;
      },
    });

    console.log("Response Status:", response.status);
    console.log("Response Headers:", response.headers);
    console.log("Response Data:", response.data);

    if (response.status === 200 && response.data) {
      res.json({
        status: "success",
        data: response.data,
      });
    } else {
      res.status(response.status).json({
        status: "error",
        message: "아이템 정보를 찾을 수 없습니다.",
        details: response.data,
      });
    }
  } catch (error) {
    console.error("API Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    res.status(500).json({
      status: "error",
      message: "API 요청 중 오류가 발생했습니다.",
      error: error.response?.data || error.message,
    });
  }
});

// 다중 아이템 상세 정보 조회
router.post("/cyphers/cy/multi/battleitems", async (req, res) => {
  try {
    const { itemIds } = req.body;
    console.log("Requesting multiple items with IDs:", itemIds);

    const url = `${BASE_URL}/cy/multi/battleitems`;
    console.log("Request URL:", url);

    const response = await axios({
      method: "get",
      url: url,
      params: {
        itemIds,
        apikey: API_KEY,
      },
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      validateStatus: function (status) {
        return status >= 200 && status < 500;
      },
    });

    console.log("Response Status:", response.status);
    console.log("Response Headers:", response.headers);
    console.log("Response Data:", response.data);

    if (response.status === 200 && response.data) {
      res.json({
        status: "success",
        data: response.data,
      });
    } else {
      res.status(response.status).json({
        status: "error",
        message: "아이템 정보를 찾을 수 없습니다.",
        details: response.data,
      });
    }
  } catch (error) {
    console.error("API Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    res.status(500).json({
      status: "error",
      message: "API 요청 중 오류가 발생했습니다.",
      error: error.response?.data || error.message,
    });
  }
});

// 캐릭터 정보
router.post("/cyphers/cy/characters", async (req, res) => {
  try {
    console.log("Requesting character information");

    const url = `${BASE_URL}/cy/characters`;
    console.log("Request URL:", url);

    const response = await axios({
      method: "get",
      url: url,
      params: {
        apikey: API_KEY,
      },
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      validateStatus: function (status) {
        return status >= 200 && status < 500;
      },
    });

    console.log("Response Status:", response.status);
    console.log("Response Headers:", response.headers);
    console.log("Response Data:", response.data);

    if (response.status === 200 && response.data) {
      res.json({
        status: "success",
        data: response.data,
      });
    } else {
      res.status(response.status).json({
        status: "error",
        message: "캐릭터 정보를 찾을 수 없습니다.",
        details: response.data,
      });
    }
  } catch (error) {
    console.error("API Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    res.status(500).json({
      status: "error",
      message: "API 요청 중 오류가 발생했습니다.",
      error: error.response?.data || error.message,
    });
  }
});

// 여기에 추가 API 엔드포인트를 정의할 수 있습니다.

module.exports = router;
