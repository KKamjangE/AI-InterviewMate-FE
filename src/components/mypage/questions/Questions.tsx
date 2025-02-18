import styled from "@emotion/styled";
import { Dialog, DialogActions, DialogTitle } from "@mui/material";
import { Link } from "react-router-dom";
import { StyledBtn } from "styles/StyledBtn";
import { useState } from "react";
import { useDeleteQuestionBoxes } from "hooks/queries/questionBoxes";
import { PagesPath } from "constants/pages";

const StyledQuestions = styled.div`
  width: 1200px;
  height: 78px;
  box-sizing: border-box;
  box-shadow: 0px 6px 24px 0px rgba(218, 130, 23, 0.1), 6px 0px 24px 0px rgba(0, 115, 255, 0.1);
  margin-bottom: 32px;
  border-radius: 5px 15px;
  border: 2px solid var(--main-black);
  background-color: var(--main-white);
  color: var(--main-black);
  transition: all 0.2s;
  filter: drop-shadow(0px 6px 24px rgba(0, 0, 0, 0.03));
  &:hover {
    box-shadow: 0px 6px 24px 0px rgba(218, 130, 23, 0.357), 6px 0px 24px 0px rgba(0, 115, 255, 0.357);
  }
  & button {
    font-weight: 500;
    font-size: 1.6rem;
  }
  .contents {
    height: 100%;
    padding: 0 30px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .questionInfo {
      display: flex;
      align-items: center;
      span {
        margin-right: 24px;
      }
    }
  }
`;

const StyledLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 980px;
  padding: 30px 0;
  h2 {
    font-size: 2rem;
    font-weight: 500;
    margin: 0;
    color: var(--main-black);
  }
  span {
    color: var(--main-black);
    font-size: 1.6rem;
  }
`;

const StyledBtnStlyed = styled(StyledBtn)`
  margin-right: 25px;
`;

interface StyledClearBtnProps {
  questionNum: number;
}

const StyledClearBtn = styled(StyledBtn)<StyledClearBtnProps>`
  opacity: ${props => (props.questionNum === 0 ? 0.3 : 1)};
  &:hover {
    background-color: ${props => (props.questionNum ? "" : "var(--main-white)")};
    color: ${props => (props.questionNum ? "" : "var(--main-black)")};
    cursor: ${props => (props.questionNum ? "" : "default")};
  }
`;

interface QuestionsProps {
  boxName: string;
  idx: number;
  questionNum: number;
}

const Questions = ({ boxName, idx, questionNum }: QuestionsProps) => {
  const [ isOpen, setIsOpen ] = useState(false);
  const { mutate, isLoading } = useDeleteQuestionBoxes();
  const handleClickDelete = () => {
    setIsOpen(true);
  };
  const handleClickClose = () => {
    setIsOpen(false);
  };
  const handleClickClear = () => {
    if (isLoading) {
      return;
    }
    mutate(idx, {
      onSuccess: () => {
        setIsOpen(false);
      },
      onError(error) {
        alert(error);
      },
    });
  };
  return (
    <StyledQuestions>
      <div className="contents">
        <StyledLink to={`${PagesPath.QUESTIONS_DETAILS}?box=${idx}`}>
          <h2>{boxName}</h2>
          <span>{questionNum} / 30</span>
        </StyledLink>
        <StyledClearBtn
          questionNum={questionNum}
          onClick={handleClickDelete}
          width="140px"
          height="52px"
          color="red"
          disabled={!questionNum}
        >
          비우기
        </StyledClearBtn>
        <Dialog
          open={isOpen}
          onClose={handleClickClose}
          PaperProps={{
            style: {
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              padding: "50px 35px",
            },
          }}
        >
          <DialogTitle
            fontSize={24}
            fontWeight={400}
            color={"var(--main-black)"}
            marginBottom={9}
            padding={0}
          >
            꾸러미를 비우시겠습니까?
          </DialogTitle>
          <DialogActions>
            <StyledBtnStlyed onClick={handleClickClear} width="200px" height="42px" color="orange">
              네!
            </StyledBtnStlyed>
            <StyledBtn onClick={handleClickClose} width="200px" height="42px" color="red">
              취소
            </StyledBtn>
          </DialogActions>
        </Dialog>
      </div>
    </StyledQuestions>
  );
};

export default Questions;
