import { useEffect, useState } from "react";
import SelectBranchOption from "./SelectBranchOption";
import BranchInputForm from "./BranchInputForm";
import { BranchForIngredientProps } from "@/types/ingredient";
import { Button } from "../ui/button";
import { ChevronLeft } from "lucide-react";

export default function BranchForIngredient({branches, selectedBranch, onAddBranch, onSelectBranch, nextHandler }: BranchForIngredientProps){
    // State untuk mengontrol visibility form tambah branch
    const [isAdding, setIsAdding] = useState<boolean>(true);

    useEffect(() => {
      setIsAdding(branches.length === 0)
    },[branches])

    return (
      <>
          {/* KONDISI 1: ADA BRANCH DAN TIDAK SEDANG DALAM MODE TAMBAH */}
          {(branches.length > 0 && !isAdding) ? (
              <SelectBranchOption 
                  branches={branches}
                  selectedBranch={selectedBranch}
                  onSelectBranch={onSelectBranch}
                  setIsAdding={setIsAdding}
                  nextHandler={nextHandler}
              />
          ) : (

            /* KONDISI 2: BRANCH KOSONG ATAU SEDANG DALAM MODE TAMBAH FORM */
            <>
            <div className={`flex ${branches.length === 0 ? 'justify-center' : '' } mt-3`}>
              <Button
                  size={`sm`}
                  variant={`outline`}
                  onClick={() => setIsAdding(false)} 
                  disabled={branches.length === 0}
                  >
                  {branches.length === 0 ? `You don't have any branches yet` : (<><ChevronLeft /> Back</>)}
              </Button>
            </div>

            <BranchInputForm 
              onSubmit={(newBranch) => {
                () => onAddBranch(newBranch)
                if (branches.length > 0) {
                    setIsAdding(false);
                }
              }}    
            />
            </>
          )}
      </>
   
  );
}