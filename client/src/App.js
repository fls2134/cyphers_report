import React, { useState } from "react";
import "./App.css";

function App() {
  const [selectedApi, setSelectedApi] = useState("");
  const [params, setParams] = useState({});
  const [response, setResponse] = useState(null);
  const [nextPage, setNextPage] = useState(null);

  const apiList = [
    { id: "players", name: "플레이어 검색", endpoint: "/cy/players" },
    {
      id: "playerInfo",
      name: "플레이어 정보 조회",
      endpoint: "/cy/players/:playerId",
    },
    {
      id: "playerMatches",
      name: "플레이어 매칭 기록 조회",
      endpoint: "/cy/players/:playerId/matches",
    },
    {
      id: "matchDetail",
      name: "매칭 상세 정보 조회",
      endpoint: "/cy/matches/:matchId",
    },
    {
      id: "ratingRanking",
      name: "통합 랭킹 조회",
      endpoint: "/cy/ranking/ratingpoint",
    },
    {
      id: "characterRanking",
      name: "캐릭터 랭킹 조회",
      endpoint: "/cy/ranking/characters/:characterId/:rankingType",
    },
    {
      id: "tsjRanking",
      name: "투신전 랭킹 조회",
      endpoint: "/cy/ranking/tsj/:tsjType",
    },
    { id: "items", name: "아이템 검색", endpoint: "/cy/battleitems" },
    {
      id: "itemDetail",
      name: "아이템 상세 정보 조회",
      endpoint: "/cy/battleitems/:itemId",
    },
    {
      id: "multiItems",
      name: "다중 아이템 상세 정보 조회",
      endpoint: "/cy/multi/battleitems",
    },
    { id: "characters", name: "캐릭터 정보", endpoint: "/cy/characters" },
  ];

  const handleApiSelect = (api) => {
    setSelectedApi(api);
    setParams({});
    setResponse(null);
  };

  const handleParamChange = (key, value) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let endpoint = selectedApi.endpoint;

      // URL 파라미터 처리
      if (selectedApi.id === "playerInfo" && params.playerId) {
        endpoint = endpoint.replace(":playerId", params.playerId);
      } else if (selectedApi.id === "playerMatches") {
        if (!params.playerId) {
          throw new Error("플레이어 ID는 필수 입력값입니다.");
        }
        endpoint = endpoint.replace(":playerId", params.playerId);
      } else if (selectedApi.id === "matchDetail" && params.matchId) {
        endpoint = endpoint.replace(":matchId", params.matchId);
      } else if (selectedApi.id === "characterRanking") {
        if (!params.characterId || !params.rankingType) {
          throw new Error("캐릭터 ID와 랭킹 타입은 필수 입력값입니다.");
        }
        endpoint = endpoint
          .replace(":characterId", params.characterId)
          .replace(":rankingType", params.rankingType);
      } else if (selectedApi.id === "tsjRanking" && params.tsjType) {
        endpoint = endpoint.replace(":tsjType", params.tsjType);
      } else if (selectedApi.id === "itemDetail" && params.itemId) {
        endpoint = endpoint.replace(":itemId", params.itemId);
      }

      const response = await fetch(
        `http://localhost:5000/api/cyphers${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(params),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "API 요청 실패");
      }

      if (selectedApi.id === "playerMatches") {
        console.log("Matches response:", data);
        const nextValue = data.data?.matches?.next;
        console.log("Next value from response:", nextValue);

        if (nextValue) {
          console.log("Setting next page value:", nextValue);
          setNextPage(nextValue);
        } else {
          console.log("No next value found");
          setNextPage(null);
        }
      } else {
        setNextPage(null);
      }

      setResponse(data);
    } catch (error) {
      console.error("Error:", error);
      setResponse({
        status: "error",
        message: error.message,
      });
    }
  };

  const handleNextPage = async () => {
    if (!nextPage) return;

    try {
      const endpoint = selectedApi.endpoint.replace(
        ":playerId",
        params.playerId
      );
      const response = await fetch(
        `http://localhost:5000/api/cyphers${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            ...params,
            next: nextPage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "API 요청 실패");
      }

      // next 값이 data.data.matches.next에 있는지 확인
      const nextValue = data.data?.matches?.next;
      console.log("Next value from next page response:", nextValue);

      if (nextValue) {
        console.log("Setting next page value:", nextValue);
        setNextPage(nextValue);
      } else {
        console.log("No next value found in next page");
        setNextPage(null);
      }

      setResponse(data);
    } catch (error) {
      console.error("Error:", error);
      setResponse({
        status: "error",
        message: error.message,
      });
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>사이퍼즈 API 테스트</h1>
      </header>
      <main>
        <div className="api-selector">
          <h2>API 선택</h2>
          <select
            onChange={(e) =>
              handleApiSelect(apiList.find((api) => api.id === e.target.value))
            }
          >
            <option value="">API를 선택하세요</option>
            {apiList.map((api) => (
              <option key={api.id} value={api.id}>
                {api.name}
              </option>
            ))}
          </select>
        </div>

        {selectedApi && (
          <form onSubmit={handleSubmit} className="api-form">
            <h3>{selectedApi.name}</h3>
            <div className="params">
              {selectedApi.id === "players" && (
                <>
                  <input
                    type="text"
                    placeholder="닉네임"
                    onChange={(e) =>
                      handleParamChange("nickname", e.target.value)
                    }
                  />
                  <select
                    onChange={(e) =>
                      handleParamChange("wordType", e.target.value)
                    }
                  >
                    <option value="match">동일 단어</option>
                    <option value="full">전문 검색</option>
                  </select>
                </>
              )}
              {selectedApi.id === "playerInfo" && (
                <input
                  type="text"
                  placeholder="플레이어 ID"
                  onChange={(e) =>
                    handleParamChange("playerId", e.target.value)
                  }
                />
              )}
              {selectedApi.id === "playerMatches" && (
                <>
                  <input
                    type="text"
                    placeholder="플레이어 ID"
                    onChange={(e) =>
                      handleParamChange("playerId", e.target.value)
                    }
                    required
                  />
                  <input
                    type="text"
                    placeholder="게임 타입 ID (선택)"
                    onChange={(e) =>
                      handleParamChange("gameTypeId", e.target.value)
                    }
                  />
                  <input
                    type="datetime-local"
                    placeholder="시작일 (선택)"
                    onChange={(e) => {
                      const date = new Date(e.target.value);
                      const formattedDate = date
                        .toISOString()
                        .slice(0, 16)
                        .replace("T", " ");
                      handleParamChange("startDate", formattedDate);
                    }}
                  />
                  <input
                    type="datetime-local"
                    placeholder="종료일 (선택)"
                    onChange={(e) => {
                      const date = new Date(e.target.value);
                      const formattedDate = date
                        .toISOString()
                        .slice(0, 16)
                        .replace("T", " ");
                      handleParamChange("endDate", formattedDate);
                    }}
                  />
                  <input
                    type="number"
                    placeholder="반환 Row 수 (선택)"
                    onChange={(e) => handleParamChange("limit", e.target.value)}
                  />
                </>
              )}
              {selectedApi.id === "matchDetail" && (
                <input
                  type="text"
                  placeholder="매치 ID"
                  onChange={(e) => handleParamChange("matchId", e.target.value)}
                />
              )}
              {selectedApi.id === "ratingRanking" && (
                <>
                  <input
                    type="text"
                    placeholder="플레이어 ID (선택)"
                    onChange={(e) =>
                      handleParamChange("playerId", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    placeholder="시작 위치 (선택)"
                    onChange={(e) =>
                      handleParamChange("offset", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    placeholder="개수 (선택)"
                    onChange={(e) => handleParamChange("limit", e.target.value)}
                  />
                </>
              )}
              {selectedApi.id === "characterRanking" && (
                <>
                  <input
                    type="text"
                    placeholder="캐릭터 ID (필수)"
                    onChange={(e) =>
                      handleParamChange("characterId", e.target.value)
                    }
                    required
                  />
                  <select
                    onChange={(e) =>
                      handleParamChange("rankingType", e.target.value)
                    }
                    required
                  >
                    <option value="">랭킹 타입 선택 (필수)</option>
                    <option value="winCount">승리수</option>
                    <option value="winRate">승률</option>
                    <option value="killCount">킬</option>
                    <option value="assistCount">도움</option>
                    <option value="exp">경험치</option>
                  </select>
                  <input
                    type="text"
                    placeholder="플레이어 ID (선택)"
                    onChange={(e) =>
                      handleParamChange("playerId", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    placeholder="시작 위치 (선택)"
                    onChange={(e) =>
                      handleParamChange("offset", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    placeholder="개수 (선택)"
                    onChange={(e) => handleParamChange("limit", e.target.value)}
                  />
                </>
              )}
              {selectedApi.id === "tsjRanking" && (
                <>
                  <select
                    onChange={(e) =>
                      handleParamChange("tsjType", e.target.value)
                    }
                  >
                    <option value="melee">격</option>
                    <option value="ranged">파</option>
                  </select>
                  <input
                    type="text"
                    placeholder="플레이어 ID (선택)"
                    onChange={(e) =>
                      handleParamChange("playerId", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    placeholder="시작 위치 (선택)"
                    onChange={(e) =>
                      handleParamChange("offset", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    placeholder="개수 (선택)"
                    onChange={(e) => handleParamChange("limit", e.target.value)}
                  />
                </>
              )}
              {selectedApi.id === "items" && (
                <>
                  <input
                    type="text"
                    placeholder="아이템 이름"
                    onChange={(e) =>
                      handleParamChange("itemName", e.target.value)
                    }
                  />
                  <select
                    onChange={(e) =>
                      handleParamChange("wordType", e.target.value)
                    }
                  >
                    <option value="match">동일 단어</option>
                    <option value="full">전문 검색</option>
                  </select>
                  <input
                    type="text"
                    placeholder="캐릭터 ID (선택)"
                    onChange={(e) =>
                      handleParamChange("characterId", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    placeholder="슬롯 코드 (선택)"
                    onChange={(e) =>
                      handleParamChange("slotCode", e.target.value)
                    }
                  />
                </>
              )}
              {selectedApi.id === "itemDetail" && (
                <input
                  type="text"
                  placeholder="아이템 ID"
                  onChange={(e) => handleParamChange("itemId", e.target.value)}
                />
              )}
              {selectedApi.id === "multiItems" && (
                <input
                  type="text"
                  placeholder="아이템 ID들 (쉼표로 구분)"
                  onChange={(e) => handleParamChange("itemIds", e.target.value)}
                />
              )}
            </div>
            <button type="submit">요청</button>
          </form>
        )}

        {response && (
          <div className="response">
            <h3>응답 결과</h3>
            <pre>{JSON.stringify(response, null, 2)}</pre>
            {selectedApi.id === "playerMatches" && nextPage && (
              <button onClick={handleNextPage} className="next-button">
                다음 페이지
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
