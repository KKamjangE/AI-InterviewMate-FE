import styled from "@emotion/styled";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { RiGitRepositoryPrivateFill } from "react-icons/ri";
import { MdPublic } from "react-icons/md";
import { RoomStatus } from "api/interview/type";
import { RoomTypes } from "api/mypage/types";
import { useNavigate } from "react-router-dom";
import { usePostJoinRoom } from "hooks/queries/interview";
import { useSetRecoilState } from "recoil";
import { interviewDataAtom, isInterviewerAtom } from "store/interview/atom";

interface IRoomProps {
  roomType: RoomTypes;
  roomStatus: RoomStatus;
}

const StyledRoom = styled.div<IRoomProps>`
  margin-bottom: 40px;
  .room {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 488px;
    height: 165px;
    border-radius: 16px;
    border: 2px solid var(--main-black);
    box-shadow: 0px 6px 10px 0px rgba(255, 132, 0, 0.2), 6px 0px 10px 0px rgba(0, 162, 255, 0.03);
    background-color: var(--main-white);
    padding: 28px 42px;
    cursor: pointer;
    transition: box-shadow 300ms;
    &:hover {
      box-shadow: 0px 6px 24px 0px rgba(218, 130, 23, 0.357), 6px 0px 24px 0px rgba(0, 115, 255, 0.357);
    }
    .roomHeader {
      display: flex;
      justify-content: space-between;
      .roomName {
        color: var(--main-black);
        text-align: left;
        p {
          margin: 0;
          margin-bottom: 14px;
          font-size: 2rem;
          font-weight: 500;
        }
        span {
          font-size: 1.2rem;
        }
      }
      .interviewer {
        width: 100px;
        height: 24px;
        font-size: 1.2rem;
        background-color: ${props =>
    props.roomType === "AI" ? "var(--push-gray)" : "var(--main-black)"};
        border-radius: 5px;
        color: var(--main-white);
      }
    }
    .roomState {
      text-align: left;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--font-gray);
      font-size: 1.6rem;
      p {
        margin: 0;
      }
      .roomStatus {
        color: ${props =>
    props.roomStatus === "CREATE" ? "var(--main-orange)" : "var(--main-black)"};
      }
      .warningComment {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 1rem;
        line-height: 1.5;
        p {
          margin-left: 6px;
        }
      }
      .roomInfo {
        display: flex;
        align-items: flex-end;
        span {
          font-size: 1.6rem;
          margin-right: 12px;
        }
      }
    }
  }
`;

interface RoomProps {
  roomName: string; // 방 제목
  roomType: RoomTypes; // AI 면접, 유저 면접
  roomIsPrivate: boolean; // 잠금 여부
  roomStatus: RoomStatus; // 방 상태
  roomTime?: number; // 인터뷰 시간
  interviewerIdxes: number; // 현재 인원 수
  roomPeopleNum: number; // 총 인원 수
  idx: number;
  setIsJoinError: (text: boolean) => void;
  setIsPasswordPopupOpen: (b: boolean) => void;
  setTargetRoomIdx: (idx: number) => void;
}
const Room = ({
  roomName,
  roomType,
  roomIsPrivate,
  roomStatus,
  roomTime,
  interviewerIdxes,
  roomPeopleNum,
  idx,
  setIsJoinError,
  setIsPasswordPopupOpen,
  setTargetRoomIdx,
}: RoomProps) => {
  const setUserInterviewData = useSetRecoilState(interviewDataAtom);
  const navigate = useNavigate();
  const { mutate, isLoading } = usePostJoinRoom();
  const setIsInterviewer = useSetRecoilState(isInterviewerAtom);
  const onClickJoin = () => {
    setTargetRoomIdx(idx);

    if (roomType === "USER" && roomIsPrivate) {
      // ! TODO: 비밀번호 검증
      // ! src/components/modal/lobby/RoomPasswordPopup/index.tsx에서도 추가 작업 필요
      setIsPasswordPopupOpen(true);
      return;
    }
    if (roomType === "AI" || interviewerIdxes === roomPeopleNum || roomStatus === "PROCEED") {
      setIsJoinError(true);
      return;
    }
    if (!isLoading) {
      mutate(
        {
          roomIdx: idx,
          password: null, // TODO: 비밀번호 검증
        },
        {
          onSuccess: ({ data }) => {
            setUserInterviewData(data.data);
            setIsInterviewer(true);
            navigate("/interview/user");
          },
          onError(error) {
            alert(error);
          },
        },
      );
    }
  };
  return (
    <StyledRoom roomType={roomType} roomStatus={roomStatus}>
      <div className="room" onClick={onClickJoin}>
        <div className="roomHeader">
          <div className="roomName">
            <p>{roomName}</p>
            {roomType === "AI" ? null : <span>진행 시간: {roomTime}분</span>}
          </div>
          <div className="interviewer">{roomType === "AI" ? "AI 면접관" : "유저 면접관"}</div>
        </div>
        <div className="roomState">
          <p className="roomStatus">{roomStatus === "CREATE" ? "대기 중" : "진행 중"}</p>
          {roomType === "AI" ? (
            <div className="warningComment">
              <AiOutlineInfoCircle size={25} color="var(--push-gray)" />
              <p>
                AI 면접관 방에는 입장하실 수 없습니다.
                <br />방 만들기 기능을 이용해주세요.
              </p>
            </div>
          ) : roomIsPrivate ? (
            <div className="roomInfo">
              <span>
                {interviewerIdxes} / {roomPeopleNum}
              </span>
              <RiGitRepositoryPrivateFill size={32} color="var(--push-gray)" />
            </div>
          ) : (
            <div className="roomInfo">
              <span>
                {interviewerIdxes} / {roomPeopleNum}
              </span>
              <MdPublic size={32} color="var(--push-gray)" />
            </div>
          )}
        </div>
      </div>
    </StyledRoom>
  );
};

export default Room;
