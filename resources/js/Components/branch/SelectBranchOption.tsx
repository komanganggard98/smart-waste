import { SelectBranchOptionProps } from "@/types/branch";
import { Button } from "../ui/button";

export default function SelectBranchOption({branches, selectedBranch, onSelectBranch, setIsAdding, nextHandler }: SelectBranchOptionProps){

    return (
      <section>
        <div className={`max-h-[60vh] overflow-y-auto p-1`}>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row w-full items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Select Branch</h2>
              <Button
                  size={`sm`}
                  variant={`outline`}
                  onClick={() => setIsAdding(true)} 
                  >
                  + Create New Branch
              </Button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {branches.map((branch, index) => {
                const selected = branch.id === selectedBranch
                return (
                  <div
                    key={branch.id || index}
                    onClick={() => onSelectBranch && onSelectBranch(branch)}
                    className={`p-4 rounded-xl border ${selected ? 'border-green-300 bg-green-50/50 hover:bg-green-50/50 ' : 'border-gray-100 bg-gray-50/50 hover:bg-indigo-50/50 hover:border-indigo-100'} transition-all cursor-pointer group`}
                  >
                    <h3 className="font-medium text-gray-800 group-hover:text-green-600 transition-colors">
                      {branch.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                      {branch.address}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <div>
          <Button
              type="submit"
              className={`mt-4 w-full`}
              disabled={selectedBranch === undefined}
              onClick={nextHandler}
          >
              Next          
          </Button>
        </div>
      </section>

  );
}