import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useQuestionDetails,
  useDeleteQuestion,
  usePutQuestionBoxName,
  useGetQuestionBoxes,
} from "hooks/queries/questionBoxes";
import { Question } from "api/questionBoxes/type";

import Popup from "components/common/Popup";
import QuestionDialog from "components/mypage/questions/QuestionDialog";
import Loading from "components/common/Loading";
import { StyledBtn } from "styles/StyledBtn";
import * as Styled from "./style";

const QuestionDetails = () => {
  const [ searchParams ] = useSearchParams();
  const [ title, setTitle ] = useState("");
  const [ showCheckIcon, setShowCheckIcon ] = useState(false);
  const [ isDialogOpen, setIsDialogOpen ] = useState(false);
  const [ isModifying, setIsModifying ] = useState(false);
  const [ currQuestion, setCurrQuestion ] = useState<null | Question>(null);
  const [ isDeletePopupOpen, setIsDeletePopupOpen ] = useState(false);
  const [ deleteTarget, setDeleteTarget ] = useState<null | Question>(null);

  const {
    data,
    refetch,
    isSuccess,
    isFetching,
  } = useQuestionDetails(
    Number(searchParams.get("box")),
  );
  const {
    refetch: refetchList,
  } = useGetQuestionBoxes();
  const {
    mutate: deleteQuestion,
    isLoading: isDeleteLoading,
    isSuccess: isDeleteSuccess,
  } = useDeleteQuestion();
  const {
    mutate: modifyQuestionBoxName,
    isSuccess: isModifyComplete,
  } = usePutQuestionBoxName();

  useEffect(() => {
    if (data) {
      setTitle(data.data?.data?.questionBoxName ?? "");
    }
  }, [ data ]);

  useEffect(() => {
    if (isModifyComplete) {
      setShowCheckIcon(true);

      const timerId = window.setTimeout(() => {
        setShowCheckIcon(false);
      }, 1000 * 3);

      refetch();
      refetchList();

      return (() => {
        window.clearTimeout(timerId);
      });
    }
  }, [ isModifyComplete ]);

  useEffect(() => {
    if (isDeleteLoading) {
      return;
    }

    if (isDeleteSuccess) {
      refetch();
      refetchList();
    }
  }, [ isDeleteLoading ]);

  const questionBoxIdx = useMemo(() => {
    return Number(searchParams.get("box") ?? 999);
  }, [ searchParams ]);

  const questions = useMemo(() => {
    if (data) {
      return data?.data?.data?.questions ?? [];
    }
    else {
      return [];
    }
  }, [ data ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleQuestionDelete = (question: Question) => {
    setDeleteTarget(question);
    setIsDeletePopupOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) {
      setIsDeletePopupOpen(false);
      return;
    }

    deleteQuestion(
      deleteTarget.questionIdx,
      {
        onSuccess: () => {
          setIsDeletePopupOpen(false);
        },
      },
    );
  };

  const handleTitleModify = () => {
    modifyQuestionBoxName({
      questionBoxIdx,
      questionBoxName: title,
    });
  };

  const handleQuestionModifyButton = (question: Question) => {
    setCurrQuestion(question);
    setIsModifying(true);
    setIsDialogOpen(true);
  };

  const handleQuestionAddButton = () => {
    setCurrQuestion(null);
    setIsModifying(false);
    setIsDialogOpen(true);
  };

  if (isFetching) {
    return (
      <Styled.Wrapper>
        <Loading margin="0" />
      </Styled.Wrapper>
    );
  }

  return (
    <Styled.Wrapper>
      {isSuccess && data ? (
        <>
          {isDialogOpen && (
            <QuestionDialog
              isModifying={isModifying}
              currQuestion={currQuestion}
              questionBoxIdx={questionBoxIdx}
              refetch={refetch}
              isOpen={isDialogOpen}
              handleClose={() => setIsDialogOpen(false)}
            />
          )}
          {isDeletePopupOpen && (
            <Popup
              open={isDeletePopupOpen}
              onClose={() => setIsDeletePopupOpen(false)}
              onConfirm={handleDeleteConfirm}
              confirmText="네!"
              cancelText="취소"
            >
              <p>질문을 삭제하시겠습니까?</p>
            </Popup>
          )}
          <Styled.TitleWrap>
            <Styled.HiddenLabel htmlFor="question-box-name">
              질문 꾸러미 이름
            </Styled.HiddenLabel>
            <Styled.Input id="question-box-name" value={title} onChange={handleChange} />
            <Styled.EditButton type="button" onClick={handleTitleModify}>
              수정
            </Styled.EditButton>
            {showCheckIcon && <Styled.CheckIcon>✅</Styled.CheckIcon>}
          </Styled.TitleWrap>
          <Styled.List>
            {questions.length ? questions.map((question) =>
              <Styled.Question key={question.questionIdx}>
                <Styled.LeftSecion>
                  <Styled.Icon>Q.</Styled.Icon>
                  <Styled.QuestionButton
                    type="button"
                    onClick={() => {
                      handleQuestionModifyButton(question);
                    }}
                  >
                    {question.questionTitle}
                  </Styled.QuestionButton>
                </Styled.LeftSecion>
                <StyledBtn
                  type="button"
                  onClick={() => handleQuestionDelete(question)}
                  width="120px"
                  height="52px"
                  color="red"
                  style={{ fontSize: "1.4rem" }}
                >
                  삭제
                </StyledBtn>
              </Styled.Question>,
            ) : (
              <p className="empty">📝 등록된 질문이 없습니다.</p>
            )}
            <Styled.FixedBottom>
              <Styled.AddQuestionButton type="button" onClick={handleQuestionAddButton}>
                + 질문 추가하기
              </Styled.AddQuestionButton>
            </Styled.FixedBottom>
          </Styled.List>
        </>
      ) : (
        <div>
          <p>데이터를 불러오는 중 에러가 발생했습니다.</p>
        </div>
      )}
    </Styled.Wrapper>
  );
};

export default QuestionDetails;
